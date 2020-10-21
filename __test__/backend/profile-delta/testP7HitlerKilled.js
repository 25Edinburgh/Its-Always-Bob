import { profileDelta } from '../../../models/profile/utils';
import buildEnhancedGameSummary from '../../../models/game-summary/buildEnhancedGameSummary';
import { p7BobSentHome } from '../../mocks';

export default () => {
	const game = buildEnhancedGameSummary(p7BobSentHome);

	describe('Bob sent home, 7p', () => {
		it('Thrall', () => {
			const delta = profileDelta('Thrall', game);

			expect(delta.stats.matches.allMatches.events).toBe(1);
			expect(delta.stats.matches.allMatches.successes).toBe(1);

			expect(delta.stats.matches.camper.events).toBe(1);
			expect(delta.stats.matches.camper.successes).toBe(1);

			expect(delta.stats.matches.bam.events).toBe(0);
			expect(delta.stats.matches.bam.successes).toBe(0);

			expect(delta.stats.actions.voteAccuracy.events).toBe(0);
			expect(delta.stats.actions.voteAccuracy.successes).toBe(0);

			expect(delta.stats.actions.shotAccuracy.events).toBe(1);
			expect(delta.stats.actions.shotAccuracy.successes).toBe(1);

			expect(delta.recentGames.loyalty).toBe('camper');
			expect(delta.recentGames.playerSize).toBe(7);
			expect(delta.recentGames.isWinner).toBe(true);
		});

		it('Jaina', () => {
			const delta = profileDelta('Jaina', game);

			expect(delta.stats.matches.allMatches.events).toBe(1);
			expect(delta.stats.matches.allMatches.successes).toBe(0);

			expect(delta.stats.matches.camper.events).toBe(0);
			expect(delta.stats.matches.camper.successes).toBe(0);

			expect(delta.stats.matches.bam.events).toBe(1);
			expect(delta.stats.matches.bam.successes).toBe(0);

			expect(delta.stats.actions.voteAccuracy.events).toBe(0);
			expect(delta.stats.actions.voteAccuracy.successes).toBe(0);

			expect(delta.stats.actions.shotAccuracy.events).toBe(0);
			expect(delta.stats.actions.shotAccuracy.successes).toBe(0);

			expect(delta.recentGames.loyalty).toBe('bam');
			expect(delta.recentGames.playerSize).toBe(7);
			expect(delta.recentGames.isWinner).toBe(false);
		});

		it('Malfurian', () => {
			const delta = profileDelta('Malfurian', game);

			expect(delta.stats.matches.allMatches.events).toBe(1);
			expect(delta.stats.matches.allMatches.successes).toBe(0);

			expect(delta.stats.matches.camper.events).toBe(0);
			expect(delta.stats.matches.camper.successes).toBe(0);

			expect(delta.stats.matches.bam.events).toBe(1);
			expect(delta.stats.matches.bam.successes).toBe(0);

			expect(delta.stats.actions.voteAccuracy.events).toBe(0);
			expect(delta.stats.actions.voteAccuracy.successes).toBe(0);

			expect(delta.stats.actions.shotAccuracy.events).toBe(0);
			expect(delta.stats.actions.shotAccuracy.successes).toBe(0);

			expect(delta.recentGames.loyalty).toBe('bam');
			expect(delta.recentGames.playerSize).toBe(7);
			expect(delta.recentGames.isWinner).toBe(false);
		});
	});
};
