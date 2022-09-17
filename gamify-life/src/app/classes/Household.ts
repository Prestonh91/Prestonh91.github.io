import { Guardian } from "./index";

interface GObject {
	[key: string]: boolean,
}

export class Household {
	public name: string | null = null;
	public uid: string | null = null;

	public dateCreated: Date = new Date();
	public dateUpdated: Date = new Date();

	public guardians: GObject = {};
	public wards: GObject = {};
	public quests: GObject = {};
	public perks: GObject = {};

	constructor(data: Household = {} as Household) {
		let {
			name = null,
			uid = null,
			dateCreated = new Date(),
			dateUpdated = new Date(),
			guardians = {},
			wards = {},
			quests = {},
			perks = {},
		} = data

		this.name = name
		this.uid = uid

		this.dateCreated = typeof dateCreated === 'string' ? new Date(dateCreated) : dateCreated
		this.dateUpdated = typeof dateUpdated === 'string' ? new Date(dateUpdated) : dateUpdated

		this.guardians = guardians
		this.wards = wards
		this.quests = quests
		this.perks = perks
	}

	public static createNewHousehold(name: string, uid: string, g: Guardian): Household {
		let newHouse = new Household()
		newHouse.name = name
		newHouse.uid = uid
		newHouse.addGuardian(g)
		newHouse.dateCreated = new Date()
		newHouse.dateUpdated = new Date()
		return newHouse
	}

	public addGuardian(g: Guardian) {
		let tempG = {
			...this.guardians
		}
		tempG[g.uid!] = true
		this.guardians = tempG
	}

	public removeGuardian(g: Guardian) {
		let tempG: GObject = {}
		for (var gKey of Object.keys(this.guardians).filter(x => x !== g.uid!)) {
			tempG[gKey] = true
		}
		this.guardians = tempG
	}

	public addQuest(qUid: string) {
		let tempQ = {
			...this.quests
		}
		tempQ[qUid] = true
		this.quests = tempQ
	}

	public removeQuest(qUid: string) {
		let tempQ: GObject = {}
		for (var key of Object.keys(this.quests).filter(x => x !== qUid)) {
			tempQ[key] = true
		}
		this.quests = tempQ
	}

	public addWard(wardUid: string) {
		let tempW = {
			...this.wards
		}
		tempW[wardUid] = true
		this.wards = tempW
	}

	public removeWard(wardUid: string) {
		let tempW: GObject = {}
		for (var wKey of Object.keys(this.wards).filter(x => x !== wardUid)) {
			tempW[wKey] = true
		}
		this.wards = tempW
	}

	public addPerk(perkUid: string) {
		let tempP = {
			...this.perks
		}
		tempP[perkUid] = true
		this.perks = tempP
	}

	public removePerk(perkUid: string) {
		let tempP: GObject = {}
		for (let pKey of Object.keys(this.perks).filter(x => x !== perkUid)) {
			tempP[pKey] = true
		}
		this.perks = tempP
	}

	public removePerks(perkUids: Array<string>) {
		let tempP: GObject = {}
		for (let pKey of Object.keys(this.perks).filter(x => !perkUids.includes(x))) {
			tempP[pKey] = true
		}
		this.perks = tempP
	}

	public prepareHouseholdForSave() {
		this.dateUpdated = new Date()
		return {
			...this,
			dateCreated: this.dateCreated.toISOString(),
			dateUpdated: this.dateUpdated.toISOString(),
		}
	}
}