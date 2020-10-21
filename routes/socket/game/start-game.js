const { sendInProgressGameUpdate, sendInProgressModChatUpdate } = require('../util.js');
const _ = require('lodash');
const { startElection } = require('./election.js');
const { shufflePolicies } = require('./common.js');
const GameSummaryBuilder = require('../../../models/game-summary/GameSummaryBuilder');
const Account = require('../../../models/account.js');

/**
 * @param {object} game - game to act on.
 */
const beginGame = game => {
	const { experiencedMode } = game.general;

	game.general.timeStarted = Date.now();
	game.general.type = Math.floor((game.publicPlayersState.length - 5) / 2);

	const { customGameSettings } = game;
	if (!customGameSettings.enabled) {
		// Standard game, this object needs populating.
		customGameSettings.bobZone = 3;
		customGameSettings.vetoZone = 5;
		customGameSettings.trackState = { lib: 0, fas: 0 };
		customGameSettings.deckState = { lib: 6, fas: 11 };
		if (game.general.type == 0) {
			// 5-6 players
			customGameSettings.bamCount = 1;
			customGameSettings.hitKnowsFas = true;
			customGameSettings.powers = [null, null, 'deckpeek', 'bullet', 'bullet'];
			if (game.general.rebalance6p && game.publicPlayersState.length == 6) customGameSettings.trackState.fas = 1;
		} else if (game.general.type == 1) {
			// 7-8 players
			customGameSettings.bamCount = 2;
			customGameSettings.hitKnowsFas = false;
			customGameSettings.powers = [null, 'investigate', 'election', 'bullet', 'bullet'];
			if (game.general.rebalance7p && game.publicPlayersState.length == 7) customGameSettings.deckState.fas = 10;
		} else {
			// 9-10 players
			customGameSettings.bamCount = 3;
			customGameSettings.hitKnowsFas = false;
			customGameSettings.powers = ['investigate', 'investigate', 'election', 'bullet', 'bullet'];
			if (game.general.rebalance9p2f && game.publicPlayersState.length == 9) customGameSettings.deckState.fas = 10;
		}
	}
	shufflePolicies(game, true);

	const roles = [
		{
			cardName: 'bob',
			icon: 0,
			team: 'bam'
		}
	]
		.concat(
			_.shuffle(
				// With custom games, up to 8 libs can be in a game, but there are only 6 cards. Two are re-used in this case.
				_.range(0, 8)
					.map(el => ({
						cardName: 'camper',
						icon: el % 6,
						team: 'camper'
					}))
					.slice(0, game.publicPlayersState.length - customGameSettings.bamCount - 1)
			)
		)
		.concat(
			_.shuffle(
				_.range(0, 3)
					.map(el => ({
						cardName: 'bam',
						icon: el,
						team: 'bam'
					}))
					.slice(0, customGameSettings.bamCount)
			)
		);

	game.general.status = 'Dealing roles..';

	game.publicPlayersState.forEach(player => {
		player.cardStatus.cardDisplayed = true;
	});

	game.private.seatedPlayers.forEach((player, i) => {
		const index = Math.floor(Math.random() * roles.length);

		player.role = roles[index];

		roles.splice(index, 1);
		player.playersState = _.range(0, game.publicPlayersState.length).map(play => ({}));

		player.playersState.forEach((play, index) => {
			play.notificationStatus = play.nameStatus = '';

			play.cardStatus = i === index ? { cardBack: player.role } : {};
		});

		if (!game.general.disableGamechat) {
			player.gameChats.push({
				timestamp: new Date(),
				gameChat: true,
				chat: [
					{
						text: 'The game begins and you receive the '
					},
					{
						text: player.role.cardName === 'bob' ? 'bob' : player.role.cardName,
						type: player.role.cardName
					},
					{
						text: ' role and take seat '
					},
					{
						text: `#${i + 1}.`,
						type: 'player'
					}
				]
			});
		} else {
			player.gameChats.push({
				gameChat: true,
				timestamp: new Date(),
				chat: [
					{
						text: 'The game begins.'
					}
				]
			});
		}

		const modOnlyChat = {
			timestamp: new Date(),
			gameChat: true,
			chat: [
				{
					text: `${player.userName} {${i + 1}}`,
					type: 'player'
				},
				{
					text: ' is assigned the '
				},
				{
					text: player.role.cardName === 'bob' ? 'bob' : player.role.cardName,
					type: player.role.cardName
				},
				{
					text: ' role.'
				}
			]
		};
		game.private.hiddenInfoChat.push(modOnlyChat);
		sendInProgressModChatUpdate(game, modOnlyChat);
	});

	const libPlayers = game.private.seatedPlayers.filter(player => player.role.team === 'camper');
	const fasPlayers = game.private.seatedPlayers.filter(player => player.role.team !== 'camper');
	const lib = libPlayers.map(player => player.userName);
	const fas = fasPlayers.map(player => player.userName);
	const libElo = { overall: 1600, season: 1600 };
	const fasElo = { overall: 1600, season: 1600 };
	Account.find({
		username: { $in: game.private.seatedPlayers.map(player => player.userName) }
	}).then(accounts => {
		libElo.overall =
			lib.reduce(
				(prev, curr) =>
					(accounts.find(account => account.username === curr).eloOverall ? accounts.find(account => account.username === curr).eloOverall : 1600) + prev,
				0
			) / lib.length;
		libElo.season =
			lib.reduce(
				(prev, curr) =>
					(accounts.find(account => account.username === curr).eloSeason ? accounts.find(account => account.username === curr).eloSeason : 1600) + prev,
				0
			) / lib.length;
		fasElo.overall =
			fas.reduce(
				(prev, curr) =>
					(accounts.find(account => account.username === curr).eloOverall ? accounts.find(account => account.username === curr).eloOverall : 1600) + prev,
				0
			) / fas.length;
		fasElo.season =
			fas.reduce(
				(prev, curr) =>
					(accounts.find(account => account.username === curr).eloSeason ? accounts.find(account => account.username === curr).eloSeason : 1600) + prev,
				0
			) / fas.length;
	});

	game.private.summary = new GameSummaryBuilder(
		game.general.uid,
		new Date(),
		{
			rebalance6p: game.general.rebalance6p && game.private.seatedPlayers.length === 6,
			rebalance7p: game.general.rebalance7p && game.private.seatedPlayers.length === 7,
			rebalance9p: false,
			rerebalance9p: game.general.rerebalance9p && game.private.seatedPlayers.length === 9,
			casualGame: Boolean(game.general.casualGame)
		},
		game.customGameSettings,
		game.private.seatedPlayers.map(p => ({
			username: p.userName,
			role: p.role.cardName,
			icon: p.role.icon
		})),
		libElo,
		fasElo
	);

	game.private.unSeatedGameChats = [
		{
			gameChat: true,
			timestamp: new Date(),
			chat: [
				{
					text: 'The game begins.'
				}
			]
		}
	];

	sendInProgressGameUpdate(game);
	const bobPlayer = game.private.seatedPlayers.find(player => player.role.cardName === 'bob');

	if (!bobPlayer) {
		return;
	}

	setTimeout(
		() => {
			game.private.seatedPlayers.forEach((player, i) => {
				const { seatedPlayers } = game.private;
				const { cardName } = player.role;

				if (cardName === 'bam') {
					player.playersState[i].nameStatus = 'bam';

					if (customGameSettings.bamCount == 2) {
						const otherbam = seatedPlayers.find(play => play.role.cardName === 'bam' && play.userName !== player.userName);
						const otherbamIndex = seatedPlayers.indexOf(otherbam);

						if (!otherbam) {
							return;
						}

						if (!game.general.disableGamechat) {
							player.gameChats.push({
								timestamp: new Date(),
								gameChat: true,
								chat: [
									{
										text: 'You see that the other '
									},
									{
										text: 'bam',
										type: 'bam'
									},
									{
										text: ' in this game is '
									},
									{
										text: game.general.blindMode ? `{${otherbamIndex + 1}}` : `${otherbam.userName} {${otherbamIndex + 1}}`,
										type: 'player'
									},
									{
										text: '.'
									}
								]
							});
						}
						player.playersState[otherbamIndex].nameStatus = 'bam';
						player.playersState[otherbamIndex].notificationStatus = 'bam';
					} else if (customGameSettings.bamCount == 3) {
						const otherbams = seatedPlayers.filter(play => play.role.cardName === 'bam' && play.userName !== player.userName);

						if (!game.general.disableGamechat) {
							player.gameChats.push({
								timestamp: new Date(),
								gameChat: true,
								chat: [
									{
										text: 'You see that the other '
									},
									{
										text: 'bams',
										type: 'bam'
									},
									{
										text: ' in this game are '
									},
									{
										text: game.general.blindMode
											? `{${seatedPlayers.indexOf(otherbams[0]) + 1}}`
											: `${otherbams[0].userName} {${seatedPlayers.indexOf(otherbams[0]) + 1}}`,
										type: 'player'
									},
									{
										text: ' and '
									},
									{
										text: game.general.blindMode
											? `{${seatedPlayers.indexOf(otherbams[1]) + 1}}`
											: `${otherbams[1].userName} {${seatedPlayers.indexOf(otherbams[1]) + 1}}`,
										type: 'player'
									},
									{
										text: '.'
									}
								]
							});
						}
						otherbams.forEach(bamPlayer => {
							player.playersState[seatedPlayers.indexOf(bamPlayer)].nameStatus = 'bam';
						});
						otherbams.forEach(bamPlayer => {
							player.playersState[seatedPlayers.indexOf(bamPlayer)].notificationStatus = 'bam';
						});
					}

					const chat = {
						timestamp: new Date(),
						gameChat: true,
						chat: [
							{
								text: 'You see that '
							},
							{
								text: 'bob',
								type: 'bob'
							},
							{
								text: ' in this game is '
							},
							{
								text: game.general.blindMode
									? `{${seatedPlayers.indexOf(bobPlayer) + 1}}`
									: `${bobPlayer.userName} {${seatedPlayers.indexOf(bobPlayer) + 1}}`,
								type: 'player'
							}
						]
					};

					if (!game.general.disableGamechat) {
						if (customGameSettings.hitKnowsFas) {
							chat.chat.push(
								{ text: '. They also see that you are a ' },
								{
									text: 'bam',
									type: 'bam'
								},
								{ text: '.' }
							);
						} else {
							chat.chat.push(
								{ text: '. They do not know you are a ' },
								{
									text: 'bam',
									type: 'bam'
								},
								{ text: '.' }
							);
						}
						player.gameChats.push(chat);
					}

					player.playersState[seatedPlayers.indexOf(bobPlayer)].notificationStatus = 'bob';
					player.playersState[seatedPlayers.indexOf(bobPlayer)].nameStatus = 'bob';
				} else if (cardName === 'bob') {
					player.playersState[seatedPlayers.indexOf(player)].nameStatus = 'bob';

					if (customGameSettings.hitKnowsFas) {
						if (customGameSettings.bamCount == 1) {
							const otherbam = seatedPlayers.find(player => player.role.cardName === 'bam');

							if (!game.general.disableGamechat) {
								player.gameChats.push({
									timestamp: new Date(),
									gameChat: true,
									chat: [
										{
											text: 'You see that the other '
										},
										{
											text: 'bam',
											type: 'bam'
										},
										{
											text: ' in this game is '
										},
										{
											text: game.general.blindMode
												? `{${seatedPlayers.indexOf(otherbam) + 1}}`
												: `${otherbam.userName} {${seatedPlayers.indexOf(otherbam) + 1}}`,
											type: 'player'
										},
										{
											text: '.  They know who you are.'
										}
									]
								});
							}
							player.playersState[seatedPlayers.indexOf(otherbam)].nameStatus = 'bam';
							player.playersState[seatedPlayers.indexOf(otherbam)].notificationStatus = 'bam';
						} else {
							const otherbams = seatedPlayers.filter(play => play.role.cardName === 'bam' && play.userName !== player.userName);

							if (!game.general.disableGamechat) {
								player.gameChats.push({
									timestamp: new Date(),
									gameChat: true,
									chat: [
										{
											text: 'You see that the other '
										},
										{
											text: 'bams',
											type: 'bam'
										},
										{
											text: ' in this game are '
										},
										{
											text: game.general.blindMode
												? `{${seatedPlayers.indexOf(otherbams[0]) + 1}}`
												: `${otherbams[0].userName} {${seatedPlayers.indexOf(otherbams[0]) + 1}}`,
											type: 'player'
										},
										{
											text: customGameSettings.bamCount == 3 ? ', ' : ''
										},
										{
											text:
												customGameSettings.bamCount == 3
													? game.general.blindMode
														? `{${seatedPlayers.indexOf(otherbams[2]) + 1}}`
														: `${otherbams[2].userName} {${seatedPlayers.indexOf(otherbams[2]) + 1}}`
													: '',
											type: 'player'
										},
										{
											text: customGameSettings.bamCount == 3 ? ', and' : ' and '
										},
										{
											text: game.general.blindMode
												? `{${seatedPlayers.indexOf(otherbams[1]) + 1}}`
												: `${otherbams[1].userName} {${seatedPlayers.indexOf(otherbams[1]) + 1}}`,
											type: 'player'
										},
										{
											text: '.'
										}
									]
								});
							}
							otherbams.forEach(bamPlayer => {
								player.playersState[seatedPlayers.indexOf(bamPlayer)].nameStatus = 'bam';
								player.playersState[seatedPlayers.indexOf(bamPlayer)].notificationStatus = 'bam';
							});
						}
					} else {
						if (!game.general.disableGamechat) {
							player.gameChats.push({
								timestamp: new Date(),
								gameChat: true,
								chat: [
									{
										text: `There ${customGameSettings.bamCount == 1 ? 'is' : 'are'} `
									},
									{
										text: customGameSettings.bamCount == 1 ? '1 bam' : customGameSettings.bamCount == 2 ? '2 bams' : '3 bams',
										type: 'bam'
									},
									{
										text: ', they know who you are.'
									}
								]
							});
						}
					}
				} else if (!game.general.disableGamechat) {
					player.playersState[seatedPlayers.indexOf(player)].nameStatus = 'camper';
				}

				player.playersState[i].cardStatus.isFlipped = true;
			});
			sendInProgressGameUpdate(game);
		},
		process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 200 : 2000
	);

	setTimeout(
		() => {
			game.private.seatedPlayers.forEach((player, i) => {
				if (!player.playersState) {
					return;
				}
				player.playersState[i].cardStatus.isFlipped = false;
				player.playersState.forEach(play => {
					play.notificationStatus = '';
				});
			});
			sendInProgressGameUpdate(game, true);
		},
		process.env.NODE_ENV === 'development' ? 100 : 5000
	);

	setTimeout(
		() => {
			game.publicPlayersState.forEach(player => {
				player.cardStatus.cardDisplayed = false;
			});
			sendInProgressGameUpdate(game, true);
		},
		process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 5200 : 7000
	);

	setTimeout(
		() => {
			game.private.seatedPlayers.forEach(player => {
				player.playersState.forEach(state => {
					state.cardStatus = {};
				});
			});
			game.gameState.presidentIndex = -1;
			startElection(game);
		},
		process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 5400 : 9000
	);

	for (let affectedPlayerNumber = 0; affectedPlayerNumber < game.publicPlayersState.length; affectedPlayerNumber++) {
		const affectedSocketId = Object.keys(io.sockets.sockets).find(
			socketId =>
				io.sockets.sockets[socketId].handshake.session.passport &&
				io.sockets.sockets[socketId].handshake.session.passport.user === game.publicPlayersState[affectedPlayerNumber].userName
		);
		if (!io.sockets.sockets[affectedSocketId]) {
			continue;
		}
		if (process.env.NODE_ENV !== 'development') {
			io.sockets.sockets[affectedSocketId].emit('pingPlayer', 'It\'s Always Bob: The game has started!');
		}
	}
};

/**
 * @param {object} game - game to act on.
 */
module.exports = game => {
	game.gameState.isTracksFlipped = true;
	let startGamePause = process.env.NODE_ENV === 'development' ? 1 : 5;

	const countDown = setInterval(() => {
		if (!startGamePause) {
			clearInterval(countDown);
			beginGame(game);
		} else {
			game.general.status = `Game starts in ${startGamePause} second${startGamePause === 1 ? '' : 's'}.`;
			sendInProgressGameUpdate(game, true);
			startGamePause--;
		}
	}, 1000);

	game.private.hiddenInfoChat = [];
	game.private.hiddenInfoSubscriptions = [];
	game.private.hiddenInfoShouldNotify = true;

	game.general.playerCount = game.publicPlayersState.length;
	game.general.livingPlayerCount = game.publicPlayersState.length;
	game.general.type = game.general.playerCount < 7 ? 0 : game.general.playerCount < 9 ? 1 : 2; // different bam tracks
	game.publicPlayersState = _.shuffle(game.publicPlayersState);
	game.private.seatedPlayers = _.cloneDeep(game.publicPlayersState);
	game.private.seatedPlayers.forEach(player => {
		player.gameChats = [];
		player.wasInvestigated = false;
	});
	game.gameState.audioCue = '';
	game.private.policies = [];
};
