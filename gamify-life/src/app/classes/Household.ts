import { Guardian, Ward, Quest } from "./index";

interface GObject {
	[key: string]: any,
}

export class Household {
	public name: string | null = null;
	public uid: string | null = null;

	public dateCreated: Date = new Date();
	public dateUpdated: Date = new Date();

	public guardians: GObject = new Array<Guardian>();
	public wards: Array<Ward> = new Array<Ward>();
	public quests: Array<Quest> = new Array<Quest>();

	constructor(data: Household = {} as Household) {
		let {
			name = null,
			uid = null,
			guardians = new Array<Guardian>(),
			wards = new Array<Ward>(),
			quests = new Array<Quest>()
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
		this.guardians[g.uid || ''] = true
	}

	public removeGuardian(g: Guardian) {
		delete this.guardians[g.uid || '']
	}

	public prepareHouseholdForSave() {
		return {
			...this,
			dateCreated: this.dateCreated ? this.dateCreated.toISOString() : new Date().toISOString(),
			dateUpdated: new Date().toISOString(),
		}
	}
}