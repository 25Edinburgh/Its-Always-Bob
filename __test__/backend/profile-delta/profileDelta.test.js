import '../../matchers';

// mock game tests
import testGenericGame from './testGenericGame';
import testP5BobElected from './testP5BobElected';
import testP7BobSentHome from './testP7BobSentHome';
import testP7CampersWin from './testP7CampersWin';

describe('profileDelta', () => {
	describe('it should work for', () => {
		testGenericGame();
		testP5BobElected();
		testP7BobSentHome();
		testP7CampersWin();
	});
});
