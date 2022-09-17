export class Quest {
	author: string | null = null;
	assignee: string | null = null;
	completor: string | null = null;
	dateCreated: Date | null = null;
	dateCompleted: Date | null = null;
	dateUpdated: Date | null = null;
	description: string | null = null;
	dueDate: Date | null = null;
	household: string | null = null;
	title: string | null = null;
	objectives: Array<string> = new Array<string>();
	reward: number | null = null;
	uid: string | null = null;



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
			household = null,
			title = null,
			objectives = new Array<string>(),
			reward = null,
			uid = null
		} = d

		this.author = author
		this.assignee = assignee
		this.completor = completor
		this.dateCreated = typeof dateCreated === 'string' ? new Date(dateCreated) : dateCreated
		this.dateCompleted = typeof dateCompleted === 'string' ? new Date(dateCompleted) : dateCompleted
		this.dateUpdated = typeof dateUpdated === 'string' ? new Date(dateUpdated) : dateUpdated
		this.description = description
		this.dueDate = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
		this.household = household
		this.title = title
		this.objectives = objectives || new Array<string>()
		this.reward = reward
		this.uid = uid
	}

	cleanUpObjectives() {
		this.objectives = this.objectives.filter(x => x)
	}

	prepareForSave(): Quest {
		this.cleanUpObjectives(),
		this.dateUpdated = new Date()
		return this
	}
}