const Profile = require('./index');
const Account = require('../account');
const { profiles } = require('../../routes/socket/models');
const debug = require('debug')('game:profile');
const { List } = require('immutable');
const { flattenListOpts } = require('../../utils');

// handles all stat computation logic
function profileDelta(username, game) {
	const { playerSize, isRebalanced, date, id } = game;
	const isWinner = game.isWinner(username).value();
	const loyalty = game.loyaltyOf(username).value();
	const iscamper = loyalty === 'camper';
	const isbam = !iscamper;
	const votes = game.bobZone
		.map(hz =>
			flattenListOpts(
				game
					.votesOf(username)
					.value()
					.slice(hz)
			).filter(v => game.loyaltyOf(v.presidentId).value() === 'bam' || game.roleOf(v.chancellorId).value() === 'bob')
		)
		.valueOrElse(List());
	const accurateVotes = votes.filterNot(v => {
		const { presidentId, chancellorId, ja } = v;
		const presidentLoyalty = game.loyaltyOf(presidentId).value();
		const chancellorRole = game.roleOf(chancellorId).value();

		return ja && (presidentLoyalty === 'bam' || chancellorRole === 'bob');
	});
	const shots = game.shotsOf(username).value();
	const accurateShots = shots.filter(id => game.loyaltyOf(id).value() === 'bam');

	if (game.casualGame) {
		return {
			stats: {
				matches: {
					allMatches: {
						events: 0,
						successes: 0
					},
					camper: {
						events: 0,
						successes: 0
					},
					bam: {
						events: 0,
						successes: 0
					}
				},
				actions: {
					voteAccuracy: {
						events: 0,
						successes: 0
					},
					shotAccuracy: {
						events: 0,
						successes: 0
					}
				}
			},
			recentGames: {
				_id: id,
				loyalty,
				playerSize,
				isWinner,
				isRebalanced,
				date
			}
		};
	}

	return {
		stats: {
			matches: {
				allMatches: {
					events: 1,
					successes: isWinner ? 1 : 0
				},
				camper: {
					events: iscamper ? 1 : 0,
					successes: iscamper && isWinner ? 1 : 0
				},
				bam: {
					events: isbam ? 1 : 0,
					successes: isbam && isWinner ? 1 : 0
				}
			},
			actions: {
				voteAccuracy: {
					events: iscamper ? votes.size : 0,
					successes: iscamper ? accurateVotes.size : 0
				},
				shotAccuracy: {
					events: iscamper ? shots.size : 0,
					successes: iscamper ? accurateShots.size : 0
				}
			}
		},
		recentGames: {
			_id: id,
			loyalty,
			playerSize,
			isWinner,
			isRebalanced,
			date
		}
	};
}

// username: String, game: enhancedGameSummary, options: { version: String, cache: Boolean }
function updateProfile(username, game, options = {}) {
	const { version, cache } = options;
	const delta = profileDelta(username, game);

	return (
		Profile.findByIdAndUpdate(
			username,
			{
				$inc: {
					'stats.matches.allMatches.events': delta.stats.matches.allMatches.events,
					'stats.matches.allMatches.successes': delta.stats.matches.allMatches.successes,

					'stats.matches.camper.events': delta.stats.matches.camper.events,
					'stats.matches.camper.successes': delta.stats.matches.camper.successes,

					'stats.matches.bam.events': delta.stats.matches.bam.events,
					'stats.matches.bam.successes': delta.stats.matches.bam.successes,

					'stats.actions.voteAccuracy.events': delta.stats.actions.voteAccuracy.events,
					'stats.actions.voteAccuracy.successes': delta.stats.actions.voteAccuracy.successes,

					'stats.actions.shotAccuracy.events': delta.stats.actions.shotAccuracy.events,
					'stats.actions.shotAccuracy.successes': delta.stats.actions.shotAccuracy.successes
				},
				$push: {
					recentGames: {
						$each: [delta.recentGames],
						$position: 0,
						$slice: 10
					}
				}
			},
			{
				new: true,
				upsert: true
			}
		)
			.exec()
			// drop the document when recalculating profiles
			.then(profile => {
				if (!profile) {
					return null;
				} else if (version && profile.version !== version) {
					return profile
						.update({ version }, { overwrite: true })
						.exec()
						.then(() => updateProfile(username, game, options));
				} else {
					return profile;
				}
			})
			// fetch account creation date when profile is first added
			.then(profile => {
				if (!profile) {
					return null;
				} else if (!profile.created) {
					return Account.findOne({ username: profile._id })
						.exec()
						.then(account => {
							if (account) {
								profile.created = account.created;
								return profile.save();
							} else return null;
						});
				} else {
					return profile;
				}
			})
			.then(profile => {
				if (!profile) return null;
				else if (cache) return profiles.push(profile);
				else return profile;
			})
			.catch(err => debug(err))
	);
}

// game: enhancedGameSummary, options: { version: String, cache: Boolean }
function updateProfiles(game, options = {}) {
	debug('Updating profiles for: %s', game.id);

	return Promise.all(game.players.map(p => p.username).map(username => updateProfile(username, game, options)));
}

// side effect: caches profile
function getProfile(username) {
	const profile = profiles.get(username);

	if (profile) {
		debug('Cache hit for: %s', username);
		return Promise.resolve(profile);
	} else {
		debug('Cache miss for: %s', username);
		return Profile.findById(username)
			.exec()
			.then(profile => profiles.push(profile));
	}
}

module.exports.updateProfiles = updateProfiles;
module.exports.profileDelta = profileDelta;
module.exports.getProfile = getProfile;
