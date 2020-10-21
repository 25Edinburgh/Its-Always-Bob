const mongoose = require('mongoose');
const Game = require('../models/game');
const moment = require('moment');
const _ = require('lodash');
const fs = require('fs');
const labels = [];
const data = {};
const { CURRENTSEASONNUMBER } = require('../src/frontend-scripts/node-constants');

const allPlayerGameData = {
	bamWinCount: 0,
	totalGameCount: 0,
	bamWinCountSeason: 0,
	totalGameCountSeason: 0
};
const fivePlayerGameData = {
	bamWinCount: 0,
	totalGameCount: 0,
	bamWinCountSeason: 0,
	totalGameCountSeason: 0
};
const sixPlayerGameData = {
	bamWinCount: 0,
	totalGameCount: 0,
	rebalancedbamWinCount: 0,
	rebalancedTotalGameCount: 0,
	bamWinCountSeason: 0,
	totalGameCountSeason: 0,
	rebalancedbamWinCountSeason: 0,
	rebalancedTotalGameCountSeason: 0
};
const sevenPlayerGameData = {
	bamWinCount: 0,
	totalGameCount: 0,
	rebalancedbamWinCount: 0,
	rebalancedTotalGameCount: 0,
	bamWinCountSeason: 0,
	totalGameCountSeason: 0,
	rebalancedbamWinCountSeason: 0,
	rebalancedTotalGameCountSeason: 0
};
const eightPlayerGameData = {
	bamWinCount: 0,
	totalGameCount: 0,
	bamWinCountSeason: 0,
	totalGameCountSeason: 0
};
const ninePlayerGameData = {
	bamWinCount: 0,
	totalGameCount: 0,
	rebalanced2fbamWinCount: 0,
	rebalanced2fTotalGameCount: 0,
	bamWinCountSeason: 0,
	totalGameCountSeason: 0,
	rebalanced2fbamWinCountSeason: 0,
	rebalanced2fTotalGameCountSeason: 0
};
const tenPlayerGameData = {
	bamWinCount: 0,
	totalGameCount: 0,
	bamWinCountSeason: 0,
	totalGameCountSeason: 0
};

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://localhost:27017/its-always-bob-app`);

Game.find({})
	.cursor()
	.eachAsync(game => {
		const playerCount = game.losingPlayers.length + game.winningPlayers.length;
		const bamsWon = game.winningTeam === 'bam';
		const gameDate = moment(new Date(game.date)).format('l');
		const rebalanced = (game.rebalance6p && playerCount === 6) || (game.rebalance7p && playerCount === 7) || (game.rebalance9p && playerCount === 9);
		const rebalanced9p2f = game.rebalance9p2f && playerCount === 9;

		if (
			gameDate === '5/13/2017' ||
			gameDate === moment(new Date()).format('l') ||
			(rebalanced &&
				playerCount === 9 &&
				(gameDate === '10/29/2017' || gameDate === '10/30/2017' || gameDate === '10/31/2017' || gameDate === '11/1/2017' || gameDate === '11/2/2017'))
		) {
			return;
		}

		switch (playerCount) {
			case 5:
				fivePlayerGameData.totalGameCount++;
				if (bamsWon) {
					fivePlayerGameData.bamWinCount++;
				}

				if (game.season && game.season === CURRENTSEASONNUMBER) {
					fivePlayerGameData.totalGameCountSeason++;
					if (bamsWon) {
						fivePlayerGameData.bamWinCountSeason++;
					}
				}
				break;
			case 6:
				if (rebalanced) {
					if (bamsWon) {
						sixPlayerGameData.rebalancedbamWinCount++;
					}
					sixPlayerGameData.rebalancedTotalGameCount++;

					if (game.season && game.season === CURRENTSEASONNUMBER) {
						sixPlayerGameData.rebalancedTotalGameCountSeason++;
						if (bamsWon) {
							sixPlayerGameData.rebalancedbamWinCountSeason++;
						}
					}
				} else {
					if (bamsWon) {
						sixPlayerGameData.bamWinCount++;
					}
					sixPlayerGameData.totalGameCount++;

					if (game.season && game.season === CURRENTSEASONNUMBER) {
						sixPlayerGameData.totalGameCountSeason++;
						if (bamsWon) {
							sixPlayerGameData.bamWinCountSeason++;
						}
					}
				}
				break;
			case 7:
				if (rebalanced) {
					if (bamsWon) {
						sevenPlayerGameData.rebalancedbamWinCount++;
					}
					sevenPlayerGameData.rebalancedTotalGameCount++;

					if (game.season && game.season === CURRENTSEASONNUMBER) {
						sevenPlayerGameData.rebalancedTotalGameCountSeason++;
						if (bamsWon) {
							sevenPlayerGameData.rebalancedbamWinCountSeason++;
						}
					}
				} else {
					if (bamsWon) {
						sevenPlayerGameData.bamWinCount++;
					}
					sevenPlayerGameData.totalGameCount++;

					if (game.season && game.season === CURRENTSEASONNUMBER) {
						sevenPlayerGameData.totalGameCountSeason++;
						if (bamsWon) {
							sevenPlayerGameData.bamWinCountSeason++;
						}
					}
				}
				break;
			case 8:
				eightPlayerGameData.totalGameCount++;
				if (bamsWon) {
					eightPlayerGameData.bamWinCount++;
				}
				if (game.season && game.season === CURRENTSEASONNUMBER) {
					eightPlayerGameData.totalGameCountSeason++;
					if (bamsWon) {
						eightPlayerGameData.bamWinCountSeason++;
					}
				}
				break;
			case 9:
				if (rebalanced) {
					if (bamsWon) {
						ninePlayerGameData.rebalancedbamWinCount++;
					}
					ninePlayerGameData.rebalancedTotalGameCount++;
				} else if (rebalanced9p2f) {
					if (bamsWon) {
						ninePlayerGameData.rebalanced2fbamWinCount++;
					}
					ninePlayerGameData.rebalanced2fTotalGameCount++;

					if (game.season && game.season === CURRENTSEASONNUMBER) {
						ninePlayerGameData.rebalanced2fTotalGameCountSeason++;
						if (bamsWon) {
							ninePlayerGameData.rebalanced2fbamWinCountSeason++;
						}
					}
				} else {
					if (bamsWon) {
						ninePlayerGameData.bamWinCount++;
					}
					ninePlayerGameData.totalGameCount++;
					if (game.season && game.season === CURRENTSEASONNUMBER) {
						ninePlayerGameData.totalGameCountSeason++;
						if (bamsWon) {
							ninePlayerGameData.bamWinCountSeason++;
						}
					}
				}
				break;
			case 10:
				tenPlayerGameData.totalGameCount++;
				if (bamsWon) {
					tenPlayerGameData.bamWinCount++;
				}
				if (game.season && game.season === CURRENTSEASONNUMBER) {
					tenPlayerGameData.totalGameCountSeason++;
					if (bamsWon) {
						tenPlayerGameData.bamWinCountSeason++;
					}
				}
				break;
		}
		allPlayerGameData.totalGameCount++;
		if (bamsWon) {
			allPlayerGameData.bamWinCount++;
		}
		if (game.season && game.season === CURRENTSEASONNUMBER) {
			allPlayerGameData.totalGameCountSeason++;
			if (bamsWon) {
				allPlayerGameData.bamWinCountSeason++;
			}
		}
		labels.push(moment(new Date(game.date)).format('l'));
	})
	.then(() => {
		const uLabels = _.uniq(labels),
			series = new Array(uLabels.length).fill(0);

		labels.forEach(date => {
			series[uLabels.indexOf(date)]++;
		});

		data.completedGames = {
			labels: uLabels,
			series
		};

		data.allPlayerGameData = allPlayerGameData;
		data.fivePlayerGameData = fivePlayerGameData;
		data.sixPlayerGameData = sixPlayerGameData;
		data.sevenPlayerGameData = sevenPlayerGameData;
		data.eightPlayerGameData = eightPlayerGameData;
		data.ninePlayerGameData = ninePlayerGameData;
		data.tenPlayerGameData = tenPlayerGameData;
		fs.writeFile('/var/www/its-always-bob/data/data.json', JSON.stringify(data), () => {
			mongoose.connection.close();
		});
	});
