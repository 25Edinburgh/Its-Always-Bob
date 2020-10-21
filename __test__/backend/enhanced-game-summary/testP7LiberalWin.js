import buildEnhancedGameSummary from '../../../models/game-summary/buildEnhancedGameSummary';
import { p7CampersWin } from '../../mocks';
import { List, Range } from 'immutable';
import { some, none } from 'option';
import '../../matchers';

export default () => {
	describe('Campers win: 7p', () => {
		const game = buildEnhancedGameSummary(p7CampersWin);
		const { turns } = game;

		it('last turn should have Bob elected', () => {
			expect(turns.last().isGameEndingPolicyEnacted).toBe(true);
			expect(game.winningTeam).toBe('camper');
		});
	});
};
