import {
	filterOpt,
	flattenListOpts,
	mapOpt1,
	mapOpt2,
	handDiff,
	handToPolicy,
	handToPolicies,
	policyToHand,
	text,
	handToText,
	capitalize,
	pushOpt,
	objectContains
} from '../../utils';
import { none, some } from 'option';
import { List } from 'immutable';
import '../matchers';

describe('filterOpt given an option x and a predicate p', () => {
	it('if x is none, returns none', () => {
		expect(filterOpt(none, x => x > 3)).toEqual(none);
	});

	it('if x is some(value) and p(value) === false, returns none', () => {
		expect(filterOpt(some(1), x => x > 3)).toEqual(none);
	});

	it('if x is some(value) and p(value) === true, returns x', () => {
		expect(filterOpt(some(5), x => x > 3)).toEqual(some(5));
	});
});

describe('flattenListOpts given a List[Option]', () => {
	it('if empty, then returns an empty List', () => {
		expect(flattenListOpts(List())).toListOptionEqual(List());
	});

	it('if all values are none, then returns an empty List', () => {
		expect(flattenListOpts(List([none, none, none]))).toListOptionEqual(List());
	});

	it('if some values are none, then returns a List with only the defined values', () => {
		expect(flattenListOpts(List([some(1), none, some(2), none]))).toListOptionEqual(List([1, 2]));
	});

	it('if all values are defined, then returns the same List', () => {
		expect(flattenListOpts(List([some(1), some(2), some(3)]))).toListOptionEqual(List([1, 2, 3]));
	});
});

describe('mapOpt1 should wrap a 1 arg function. If called with argument x', () => {
	const f = x => x + 1;
	const g = mapOpt1(f);

	it('if x is none, then returns none', () => {
		expect(g(none)).toEqual(none);
	});

	it('if x is some, then returns f(x.value)', () => {
		expect(g(some(1))).toEqual(some(2));
	});
});

describe('mapOpt2 should wrap a 2 arg function. If called with arguments (x,y)', () => {
	const f = (x, y) => x + y;
	const g = mapOpt2(f);

	it('if x and y are none, then returns none', () => {
		expect(g(none, none)).toEqual(none);
	});

	it('if x or y is none, then returns none', () => {
		expect(g(some(1), none)).toEqual(none);
		expect(g(none, some(1))).toEqual(none);
	});

	it('if x and y are some, then returns f(x.value, y.value)', () => {
		expect(g(some(1), some(2))).toEqual(some(3));
	});
});

describe('handDiff', () => {
	const diff = handDiff({ reds: 2, blues: 1 }, { reds: 1, blues: 1 });
	expect(diff).toEqual({ reds: 1, blues: 0 });
});

describe('handToPolicy', () => {
	expect(handToPolicy({ reds: 1, blues: 0 })).toBe('bam');
	expect(handToPolicy({ reds: 0, blues: 1 })).toBe('camper');
});

describe('handToPolicies', () => {
	expect(handToPolicies({ reds: 3, blues: 0 })).toImmutableEqual(List(['bam', 'bam', 'bam']));
	expect(handToPolicies({ reds: 2, blues: 1 })).toImmutableEqual(List(['bam', 'bam', 'camper']));
	expect(handToPolicies({ reds: 1, blues: 2 })).toImmutableEqual(List(['bam', 'camper', 'camper']));
	expect(handToPolicies({ reds: 0, blues: 3 })).toImmutableEqual(List(['camper', 'camper', 'camper']));
	expect(handToPolicies({ reds: 2, blues: 0 })).toImmutableEqual(List(['bam', 'bam']));
	expect(handToPolicies({ reds: 1, blues: 1 })).toImmutableEqual(List(['bam', 'camper']));
	expect(handToPolicies({ reds: 0, blues: 2 })).toImmutableEqual(List(['camper', 'camper']));
});

describe('policyToHand', () => {
	expect(policyToHand('camper')).toEqual({ reds: 0, blues: 1 });
	expect(policyToHand('bam')).toEqual({ reds: 1, blues: 0 });
});

describe('handToText', () => {
	// Legacy
	expect(handToText({ reds: 3, blues: 0 }, { gameSettings: { claimCharacters: 'legacy' } })).toEqual([
		text('bam', 'R', false, false),
		text('bam', 'R', false, false),
		text('bam', 'R', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 2, blues: 1 }, { gameSettings: { claimCharacters: 'legacy' } })).toEqual([
		text('bam', 'R', false, false),
		text('bam', 'R', false, false),
		text('camper', 'B', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 1, blues: 2 }, { gameSettings: { claimCharacters: 'legacy' } })).toEqual([
		text('bam', 'R', false, false),
		text('camper', 'B', false, false),
		text('camper', 'B', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 0, blues: 3 }, { gameSettings: { claimCharacters: 'legacy' } })).toEqual([
		text('camper', 'B', false, false),
		text('camper', 'B', false, false),
		text('camper', 'B', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 2, blues: 0 }, { gameSettings: { claimCharacters: 'legacy' } })).toEqual([
		text('bam', 'R', false, false),
		text('bam', 'R', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 1, blues: 1 }, { gameSettings: { claimCharacters: 'legacy' } })).toEqual([
		text('bam', 'R', false, false),
		text('camper', 'B', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 0, blues: 2 }, { gameSettings: { claimCharacters: 'legacy' } })).toEqual([
		text('camper', 'B', false, false),
		text('camper', 'B', false, false),
		text('normal', '')
	]);

	// Short
	expect(handToText({ reds: 3, blues: 0 })).toEqual([
		text('bam', 'F', false, false),
		text('bam', 'F', false, false),
		text('bam', 'F', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 2, blues: 1 })).toEqual([
		text('bam', 'F', false, false),
		text('bam', 'F', false, false),
		text('camper', 'L', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 1, blues: 2 })).toEqual([
		text('bam', 'F', false, false),
		text('camper', 'L', false, false),
		text('camper', 'L', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 0, blues: 3 })).toEqual([
		text('camper', 'L', false, false),
		text('camper', 'L', false, false),
		text('camper', 'L', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 2, blues: 0 })).toEqual([text('bam', 'F', false, false), text('bam', 'F', false, false), text('normal', '')]);

	expect(handToText({ reds: 1, blues: 1 })).toEqual([text('bam', 'F', false, false), text('camper', 'L', false, false), text('normal', '')]);

	expect(handToText({ reds: 0, blues: 2 })).toEqual([text('camper', 'L', false, false), text('camper', 'L', false, false), text('normal', '')]);

	// Full
	expect(handToText({ reds: 3, blues: 0 }, { gameSettings: { claimCharacters: 'full' } })).toEqual([
		text('bam', 'bam', false, true),
		text('bam', 'bam', false, true),
		text('bam', 'bam', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 2, blues: 1 }, { gameSettings: { claimCharacters: 'full' } })).toEqual([
		text('bam', 'bam', false, true),
		text('bam', 'bam', false, true),
		text('camper', 'camper', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 1, blues: 2 }, { gameSettings: { claimCharacters: 'full' } })).toEqual([
		text('bam', 'bam', false, true),
		text('camper', 'camper', false, true),
		text('camper', 'camper', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 0, blues: 3 }, { gameSettings: { claimCharacters: 'full' } })).toEqual([
		text('camper', 'camper', false, true),
		text('camper', 'camper', false, true),
		text('camper', 'camper', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 2, blues: 0 }, { gameSettings: { claimCharacters: 'full' } })).toEqual([
		text('bam', 'bam', false, true),
		text('bam', 'bam', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 1, blues: 1 }, { gameSettings: { claimCharacters: 'full' } })).toEqual([
		text('bam', 'bam', false, true),
		text('camper', 'camper', false, false),
		text('normal', '')
	]);

	expect(handToText({ reds: 0, blues: 2 }, { gameSettings: { claimCharacters: 'full' } })).toEqual([
		text('camper', 'camper', false, true),
		text('camper', 'camper', false, false),
		text('normal', '')
	]);
});

describe('capitalize', () => {
	expect(capitalize('')).toBe('');
	expect(capitalize('a')).toBe('A');
	expect(capitalize('asdf')).toBe('Asdf');
	expect(capitalize('Asdf')).toBe('Asdf');
	expect(capitalize('aSDF')).toBe('ASDF');
	expect(capitalize('ASDF')).toBe('ASDF');
});

describe('pushOpt', () => {
	expect(pushOpt(List(), some(1))).toImmutableEqual(List([1]));
	expect(pushOpt(List(), none)).toImmutableEqual(List());
	expect(pushOpt(List([1, 2, 3]), some(4))).toImmutableEqual(List([1, 2, 3, 4]));
	expect(pushOpt(List([1, 2, 3]), none)).toImmutableEqual(List([1, 2, 3]));
});

describe('objectContains', () => {
	expect(objectContains({}, {})).toBe(true);
	expect(objectContains({}, { x: 1 })).toBe(false);
	expect(objectContains({ x: 1 }, { x: 1 })).toBe(true);
	expect(objectContains({ x: 1 }, { x: 1, y: 2 })).toBe(false);
	expect(objectContains({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
});
