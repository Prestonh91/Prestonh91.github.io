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
	objectives: Array<string> | null = null;
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
			objectives = null,
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

	prepareForSave(): any {
		return {
			...this,
			dateCreated: this.dateCreated ? this.dateCreated.toISOString() : new Date().toISOString(),
			dateCompleted: this.dateCompleted ? this.dateCompleted.toISOString() : null,
			dateUpdated: new Date().toISOString(),
			dueDate: this.dueDate ? this.dueDate.toISOString() : null
		}
	}
}