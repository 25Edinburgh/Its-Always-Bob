const Account = require('../../models/account'),
	{games, userList, generalChats} = require('./models'),
	{secureGame} = require('./util'),
	version = require('../../version');

module.exports.sendUserGameSettings = (socket, username) => {
	Account.findOne({username})
		.then(account => {
			const userListNames = userList.map(user => user.userName);
			socket.emit('gameSettings', account.gameSettings);

			if (!userListNames.includes(username)) {
				userList.push({
					userName: username,
					wins: account.wins,
					losses: account.losses,
					status: {
						type: 'none',
						gameId: null
					}
				});
			}

			socket.emit('version', {
				current: version,
				lastSeen: account.lastVersionSeen || 'none'
			});

			io.sockets.emit('userList', {
				list: userList,
				totalSockets: Object.keys(io.sockets.sockets).length
			});
		})
		.catch(err => {
			console.log(err);
		});
};

module.exports.sendGameList = socket => {
	const formattedGames = games.map(game => ({
		name: game.general.name,
		gameStatus: game.gameState.isCompleted ? game.gameState.isCompleted : game.gameState.isTracksFlipped ? 'isStarted' : 'notStarted',
		seatedCount: game.publicPlayersState.length,
		minPlayersCount: game.general.minPlayersCount,
		maxPlayersCount: game.general.maxPlayersCount,
		experiencedMode: game.general.experiencedMode,
		disableChat: game.general.disableChat,
		disableGamechat: game.general.disableGamechat,
		enactedLiberalPolicyCount: game.trackState.liberalPolicyCount,
		enactedFascistPolicyCount: game.trackState.fascistPolicyCount,
		electionCount: game.general.electionCount,
		private: game.general.private,
		uid: game.general.uid
	}));

	if (socket) {
		socket.emit('gameList', formattedGames);
	} else {
		io.sockets.emit('gameList', formattedGames);
	}
};

module.exports.sendGeneralChats = socket => {
	socket.emit('generalChats', generalChats);
};

const sendUserList = module.exports.sendUserList = socket => { // eslint-disable-line one-var
	if (socket) {
		socket.emit('userList', {
			list: userList,
			totalSockets: Object.keys(io.sockets.sockets).length
		});
	} else {
		io.sockets.emit('userList', {
			list: userList,
			totalSockets: Object.keys(io.sockets.sockets).length
		});
	}
};

const updateUserStatus = module.exports.updateUserStatus = (username, type, gameId) => { // eslint-disable-line one-var
	const u = userList.find(u => u.userName === username);
	if (u) {
		u.status = { type, gameId };
		sendUserList();
	}
};

module.exports.sendGameInfo = (socket, uid) => {
	const game = games.find(el => el.general.uid === uid),
		{passport} = socket.handshake.session;

	if (game) {
		const _game = Object.assign({}, game);

		if (passport && Object.keys(passport).length) {
			const player = game.publicPlayersState.find(player => player.userName === passport.user);

			if (player) {
				player.leftGame = false;
				updateUserStatus(passport.user, 'playing', uid);
			} else {
				updateUserStatus(passport.user, 'observing', uid);
			}
		}

		// todo-release - doesn't work right for players who left game and then comes back into the old game - no gamechats
		_game.chats = _game.chats.concat(_game.private.unSeatedGameChats);
		socket.join(uid);
		socket.emit('gameUpdate', secureGame(_game));
	}
};