import { Guardian, Ward, Quest } from "./index";

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
			guardians = {},
			wards = {},
			quests = {}
		} = data

		this.name = name
		this.uid = uid

		this.guardians = guardians
		this.wards = wards
		this.quests = quests
	}

	public static createNewHousehold(name: string, uid: string, g: Guardian): Household {
		let newHouse = new Household()
		newHouse.name = name
		newHouse.uid = uid
		newHouse.addGuardian(g)
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
		delete this.guardians[g.uid || '']
	}

	public addQuest(qUid: string) {
		let tempQ = {
			...this.quests
		}
		tempQ[qUid] = true
		this.quests = tempQ
	}

	public removeQuest(qUid: string) {
		delete this.quests[qUid]
	}

	public addWard(wardUid: string) {
		let tempW = {
			...this.wards
		}
		tempW[wardUid] = true
		this.wards = tempW
	}

	public removeWard(wardUid: string) {
		delete this.wards[wardUid]
	}

	public prepareHouseholdForSave() {
		return {
			...this,
			dateCreated: this.dateCreated ? this.dateCreated.toISOString() : new Date().toISOString(),
			dateUpdated: new Date().toISOString(),
		}
	}
}