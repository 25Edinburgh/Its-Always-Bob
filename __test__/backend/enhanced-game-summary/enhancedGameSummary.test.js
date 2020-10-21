import buildEnhancedGameSummary from '../../../models/game-summary/buildEnhancedGameSummary';
import { mockGameSummary } from '../../mocks';
import '../../matchers';

// mock game tests
import testGenericGame from './testGenericGame';
import testP5BobElected from './testP5BobElected';
import testP7BobSentHome from './testP7BobSentHome';
import testP7CampersWin from './testP7CampersWin';
import testVeto from './testVeto';
import testVeto2 from './testVeto2';
import testBobSentHomeCampersLoss from './testBobSentHomeCampersLoss';

describe('build enhanced game summary', () => {
	const game = buildEnhancedGameSummary(mockGameSummary);

	it('should convert game summary to immutable collections and options', () => {
		const { summary, turns } = game;

		// general
		expect(summary).toBeTypeOf('object');
		expect(summary._id).toBeTypeOf('string');
		expect(summary.date).toBeInstanceOf(Date);
		expect(summary.players).toBeAList();

		const player = summary.players.first();

		expect(player).toBeTypeOf('object');
		expect(player.username).toBeTypeOf('string');
		expect(player.role).toBeTypeOf('string');

		// logs
		const logs = summary.logs;
		const log = logs.first();

		expect(logs).toBeAList();
		expect(log).toBeTypeOf('object');
		expect(log.presidentId).toBeTypeOf('number');
		expect(log.chancellorId).toBeTypeOf('number');
		expect(log.votes).toBeAList();
		expect(log.presidentHand).toBeAnOption();
		expect(log.presidentHand.value()).toBeTypeOf('object');
		expect(log.execution).toBeAnOption();

		// turns
		expect(turns).toBeAList();
		expect(turns.first()).toBeTypeOf('object');
	});

	describe('it should work for', () => {
		testGenericGame();
		testP5BobElected();
		testP7BobSentHome();
		testP7CampersWin();
		testVeto();
		testVeto2();
		testBobSentHomeCampersLoss();
	});
});
