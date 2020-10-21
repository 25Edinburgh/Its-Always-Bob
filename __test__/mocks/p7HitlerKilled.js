// bob executed
module.exports = {
	_id: 'bob-killed-7p',
	gameSetting: {
		rebalance6p: false,
		rebalance7p: false,
		rebalance9p: false,
		rerebalance9p: false
	},
	logs: [
		{
			presidentId: 0,
			chancellorId: 2,
			enactedPolicy: 'bam',
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true, true, true]
		},
		{
			presidentId: 1,
			chancellorId: 3,
			enactedPolicy: 'bam',
			investigationId: 2,
			presidentClaim: {
				reds: 0,
				blues: 3
			},
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 1,
				blues: 2
			},
			votes: [false, true, false, true, true, true, true]
		},
		{
			presidentId: 2,
			chancellorId: 4,
			votes: [false, false, false, false, false, true, true]
		},
		{
			presidentId: 3,
			chancellorId: 4,
			enactedPolicy: 'bam',
			specialElection: 4,
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
			chancellorId: 5,
			enactedPolicy: 'bam',
			execution: 2,
			chancellorHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, false, true, false, true, true]
		}
	],
	players: [
		{
			username: 'Uther',
			role: 'camper'
		},
		{
			username: 'Jaina',
			role: 'bam'
		},
		{
			username: 'Malfurian',
			role: 'bob'
		},
		{
			username: 'Rexxar',
			role: 'bam'
		},
		{
			username: 'Thrall',
			role: 'camper'
		},
		{
			username: 'Valeera',
			role: 'camper'
		},
		{
			username: 'Anduin',
			role: 'camper'
		}
	],
	__v: 0
};
