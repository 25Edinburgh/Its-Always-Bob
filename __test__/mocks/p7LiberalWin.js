// camper win
module.exports = {
	_id: 'camper-win-7p',
	gameSetting: {
		rebalance6p: false,
		rebalance7p: false,
		rebalance9p: false,
		rerebalance9p: false
	},
	logs: [
		{
			presidentId: 0,
			chancellorId: 3,
			enactedPolicy: 'camper',
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true, false, true]
		},
		{
			presidentId: 1,
			chancellorId: 6,
			enactedPolicy: 'bam',
			chancellorHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, true, true, false, false, true]
		},
		{
			presidentId: 2,
			chancellorId: 5,
			enactedPolicy: 'camper',
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, false, true, true, false, true]
		},
		{
			presidentId: 3,
			chancellorId: 4,
			enactedPolicy: 'camper',
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, false, true, false, false]
		},
		{
			presidentId: 4,
			chancellorId: 2,
			enactedPolicy: 'camper',
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, false, true, false, true, true, true]
		},
		{
			presidentId: 5,
			chancellorId: 3,
			votes: [false, false, true, true, true, false, false]
		},
		{
			presidentId: 6,
			chancellorId: 5,
			enactedPolicy: 'camper',
			chancellorHand: {
				reds: 0,
				blues: 2
			},
			presidentHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true, true, true]
		}
	],
	players: [
		{
			username: 'Uther',
			role: 'camper'
		},
		{
			username: 'Jaina',
			role: 'camper'
		},
		{
			username: 'Rexxar',
			role: 'bob'
		},
		{
			username: 'Thrall',
			role: 'camper'
		},
		{
			username: 'Malfurian',
			role: 'bam'
		},
		{
			username: 'Valeera',
			role: 'bam'
		},
		{
			username: 'Anduin',
			role: 'camper'
		}
	],
	__v: 0
};
