export class Perk {

	title: string | null;
	description: string | null;
	cost: number;
	durability: number;
	hasUnlimited: boolean;
	household: string;

	dateCreated: Date;
	dateUpdated: Date;
	dateAccepted: Date | null;
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
			dateAccepted = null,
			uid = ""
		} = data

		this.title = title
		this.description = description
		this.cost = cost
		this.durability = durability
		this.hasUnlimited = hasUnlimited
		this.household = household
		this.dateCreated = typeof dateCreated === 'string' ? new Date(dateCreated) : dateCreated
		this.dateUpdated = typeof dateUpdated === 'string' ? new Date(dateUpdated) : dateUpdated
		this.dateAccepted = typeof dateAccepted === 'string' ? new Date(dateAccepted) : dateAccepted
		this.uid = uid
	}

	static createNewPerk(data: any): Perk {
		let perk = new Perk()
		perk.title = data.title
		perk.cost = data.cost
		perk.household = data.household
		perk.durability = data.durability
		perk.hasUnlimited = data.hasUnlimited
		perk.description = data.description
		perk.dateCreated = new Date()
		perk.dateUpdated = new Date()
		return perk
	}

	removeDurability(removeAmount: Number) {
		if (this.hasUnlimited) return

		if (Number(this.durability) - Number(removeAmount) < 0) {
			throw new Error("Durability will be negative")
		}

		this.durability = Number(this.durability) - Number(removeAmount)
	}

	prepareForSave(): Perk {
		this.dateUpdated = new Date()
		return this
	}
}