import buildEnhancedGameSummary from '../../../models/game-summary/buildEnhancedGameSummary';
import { bobSentHomeCampersLoss } from '../../mocks';
import { List, Range } from 'immutable';
import { some, none } from 'option';
import matches from '../../matchers';

export default () => {
	describe('Bob sent home so campers should win', () => {
		const game = buildEnhancedGameSummary(bobSentHomeCampersLoss);
		const { turns } = game;

		it('Campers should be winning team', () => {
			expect(game.winningTeam).toBe('camper');
			expect(game.isWinner('onebobby')).toEqual(some(true));
		});
	});
};
