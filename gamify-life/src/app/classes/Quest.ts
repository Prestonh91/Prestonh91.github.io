export class Quest {
	author: string | null = null;
	assignee: string | null = null;
	completor: string | null = null;
	dateCreated: Date | null = null;
	dateCompleted: Date | null = null;
	dateUpdated: Date | null = null;
	description: string | null = null;
	dueDate: Date | null = null;
	name: string | null = null;
	objectives: Array<string> | null = null;
	reward: number | null = null;

	constructor(d: Quest = {} as Quest) {
		let {
			author = null,
			assignee = null,
			completor = null,
			dateCreated = null,
			dateCompleted = null,
			dateUpdated = null,
			description = null,
			dueDate = null,
			name = null,
			objectives = null,
			reward = null
		} = d

		this.author = author
		this.assignee = assignee
		this.completor = completor
		this.dateCreated = dateCreated
		this.dateCompleted = dateCompleted
		this.dateUpdated = dateUpdated
		this.description = description
		this.dueDate = dueDate
		this.name = name
		this.objectives = objectives || new Array<string>()
		this.reward = reward
	}

	prepareForSave(): any {
		return {
			...this,
			dateCreated: this.dateCreated ? this.dateCreated.toISOString() : new Date().toISOString(),
			dateCompleted: this.dateCompleted ? this.dateCompleted.toISOString() : new Date().toISOString(),
			dateUpdated: this.dateUpdated ? this.dateUpdated.toISOString() : new Date().toISOString(),
			dueDate: this.dueDate ? this.dueDate.toISOString() : new Date().toISOString()
		}
	}
}

// quests: {
// 	uid: {
// 		author: <<author_uid>>,
// 		assignee: <<assignee_uid>>,
// 		completor: <<completor_uid>>,
// 		completedTime: <<IsoDateString>>,
// 		description: 'A description of the quest goes here ',
// 		dueDate: <<IseDateString>>,
// 		name: 'Flight of the mops',
// 		objectives: [
// 			'Fill mop with 1 gallon of hot water',
// 			'Put in 1/4 cup of pinesole',
// 			'Mop the entire kitchen',
// 			'drain the dirty mop water in  the bathtub',
// 			'squeeze out the access water from the mop, hang it to dry,
// 			'put away the mop bucket upside down',
// 		],
// 		reward: 4934,
// 	},
// },