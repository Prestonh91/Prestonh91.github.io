export class Perk {

	title: string | null;
	description: string | null;
	cost: number;
	durability: number;
	hasUnlimited: boolean;
	household: string;

	dateCreated: Date;
	dateUpdated: Date;
	dateAccepted: Date;
	uid: string;

	constructor(data: Perk = {} as Perk) {
		let {
			title = "",
			description = "",
			cost = 0,
			durability = 0,
			hasUnlimited = false,
			household = "",
			dateCreated = new Date(),
			dateUpdated = new Date(),
			dateAccepted = new Date(),
			uid = ""
		} = data

		this.title = title
		this.description = description
		this.cost = cost
		this.durability = durability
		this.hasUnlimited = hasUnlimited
		this.household = household
		this.dateCreated = dateCreated
		this.dateUpdated = dateUpdated
		this.dateAccepted = dateAccepted
		this.uid = uid
	}

	prepareForSave() {
		return {
			...this,
			dateAccepted: this.dateAccepted.toISOString(),
			dateCreated: this.dateCreated.toISOString(),
			dateUpdated: new Date().toISOString(),
		}
	}
}