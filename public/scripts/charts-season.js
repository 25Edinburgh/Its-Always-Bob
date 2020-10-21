document.addEventListener('DOMContentLoaded', function (event) {
	// this page/code is total shit but I would need to get a different graphing library to make it better.

	const processWinrateData = (bamWinCount, totalGameCount) => {
		const fWins = Math.round((bamWinCount / totalGameCount) * 100000) / 1000;
		const lWins = Math.round(((totalGameCount - bamWinCount) / totalGameCount) * 100000) / 1000;

		return {
			series: [fWins, lWins],
			labels: [`${fWins.toFixed()}% bam wins`, `${lWins.toFixed()}% camper wins`],
		};
	};

	$.ajax({
		url: 'data',
		success: function (data) {
			new Chartist.Pie('#chart-allplayer-games-winrate', processWinrateData(data.allPlayerGameData.bamWinCount, data.allPlayerGameData.totalGameCount), {
				width: '400px',
				height: '400px',
			});

			$('#chart-allplayer-games-winrate').after(
				`<p style="text-align: center">Total games played: ${data.allPlayerGameData.totalGameCount.toLocaleString()}</p>`
			);

			new Chartist.Pie('#chart-fiveplayer-games-winrate', processWinrateData(data.fivePlayerGameData.bamWinCount, data.fivePlayerGameData.totalGameCount), {
				width: '400px',
				height: '400px',
			});

			$('#chart-fiveplayer-games-winrate').after(
				`<p style="text-align: center">Total 5 player games played: ${data.fivePlayerGameData.totalGameCount.toLocaleString()} | Percentage of bams in game: <span style="color: red; font-weight: bold">40%</span></p>`
			);

			new Chartist.Pie('#chart-sixplayer-games-winrate', processWinrateData(data.sixPlayerGameData.bamWinCount, data.sixPlayerGameData.totalGameCount), {
				width: '400px',
				height: '400px',
			});

			$('#chart-sixplayer-games-winrate').after(
				`<p style="text-align: center">Total 6 player games played: ${data.sixPlayerGameData.totalGameCount.toLocaleString()} | Percentage of bams in game: <span style="color: red; font-weight: bold">33%</span></p><h2 class="ui header centered">Winrate for 6 player games (rebalanced)</h2><div class="chart" id="chart-sixplayer-rebalanced-games-winrate"></div><p style="text-align: center">Total 6 player rebalanced games played: ${
					data.sixPlayerGameData.rebalancedTotalGameCount
				} | Percentage of bams in game: <span style="color: red; font-weight: bold">33%</span></p>`
			);

			new Chartist.Pie(
				'#chart-sixplayer-rebalanced-games-winrate',
				processWinrateData(data.sixPlayerGameData.rebalancedbamWinCount, data.sixPlayerGameData.rebalancedTotalGameCount),
				{ width: '400px', height: '400px' }
			);

			new Chartist.Pie(
				'#chart-sevenplayer-games-winrate',
				processWinrateData(data.sevenPlayerGameData.bamWinCount, data.sevenPlayerGameData.totalGameCount),
				{ width: '400px', height: '400px' }
			);

			$('#chart-sevenplayer-games-winrate').after(
				`<p style="text-align: center">Total 7 player games played: ${data.sevenPlayerGameData.totalGameCount.toLocaleString()} | Percentage of bams in game: <span style="color: red; font-weight: bold">43%</span></p><h2 class="ui header centered">Winrate for 7 player games (rebalanced)</h2><div class="chart" id="chart-sevenplayer-rebalanced-games-winrate"></div><p style="text-align: center">Total 7 player rebalanced games played: ${
					data.sevenPlayerGameData.rebalancedTotalGameCount
				} | Percentage of bams in game: <span style="color: red; font-weight: bold">43%</span></p>`
			);

			new Chartist.Pie(
				'#chart-sevenplayer-rebalanced-games-winrate',
				processWinrateData(data.sevenPlayerGameData.rebalancedbamWinCount, data.sevenPlayerGameData.rebalancedTotalGameCount),
				{ width: '400px', height: '400px' }
			);

			new Chartist.Pie(
				'#chart-eightplayer-games-winrate',
				processWinrateData(data.eightPlayerGameData.bamWinCount, data.eightPlayerGameData.totalGameCount),
				{ width: '400px', height: '400px' }
			);

			$('#chart-eightplayer-games-winrate').after(
				`<p style="text-align: center">Total 8 player games played: ${data.eightPlayerGameData.totalGameCount.toLocaleString()} | Percentage of bams in game: <span style="color: red; font-weight: bold">38%</span></p>`
			);

			new Chartist.Pie('#chart-nineplayer-games-winrate', processWinrateData(data.ninePlayerGameData.bamWinCount, data.ninePlayerGameData.totalGameCount), {
				width: '400px',
				height: '400px',
			});

			$('#chart-nineplayer-games-winrate').after(
				`<p style="text-align: center">Total 9 player games played: ${data.ninePlayerGameData.totalGameCount.toLocaleString()} | Percentage of bams in game: <span style="color: red; font-weight: bold">44%</span></p><h2 class="ui header centered">Winrate for 9 player games (rebalanced)</h2><div class="chart" id="chart-nineplayer-rebalanced-games-winrate"></div><p style="text-align: center">Total 9 player rebalanced games played: ${
					data.ninePlayerGameData.rebalanced2fbamWinCount
				} | Percentage of bams in game: <span style="color: red; font-weight: bold">44%</span></p>`
			);

			new Chartist.Pie(
				'#chart-nineplayer-rebalanced-games-winrate',
				processWinrateData(data.ninePlayerGameData.rebalanced2fbamWinCount, data.ninePlayerGameData.rebalanced2fTotalGameCount),
				{ width: '400px', height: '400px' }
			);

			new Chartist.Pie('#chart-tenplayer-games-winrate', processWinrateData(data.tenPlayerGameData.bamWinCount, data.tenPlayerGameData.totalGameCount), {
				width: '400px',
				height: '400px',
			});

			$('#chart-tenplayer-games-winrate').after(
				`<p style="text-align: center">Total 10 player games played: ${data.tenPlayerGameData.totalGameCount.toLocaleString()} | Percentage of bams in game: <span style="color: red; font-weight: bold">40%</span></p>`
			);
		},
	});
});
