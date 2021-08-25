export class Quest {
	author: string | null = null;
	assignee: string | null = null;
	completor: string | null = null;
	dateCreated: Date | null = null;
	dateCompleted: Date | null = null;
	dateUpdated: Date | null = null;
	description: string | null = null;
	dueDate: Date | null = null;
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
			title = null,
			objectives = null,
			reward = null,
			uid = null
		} = d

		this.author = author
		this.assignee = assignee
		this.completor = completor
		this.dateCreated = dateCreated
		this.dateCompleted = dateCompleted
		this.dateUpdated = dateUpdated
		this.description = description
		this.dueDate = dueDate
		this.title = title
		this.objectives = objectives || new Array<string>()
		this.reward = reward
		this.uid = uid
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