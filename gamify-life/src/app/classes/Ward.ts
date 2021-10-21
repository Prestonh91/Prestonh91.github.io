import { User } from '@firebase/auth-types'

interface GObject {
	[key: string]: any,
}

export class Ward {
	public dateCreated: Date | null = null;
	public lastUpdated: Date | null = null;
	public displayName: string | null = null;
	public email: string | null = null;
	public emailVerified: boolean | null = null;
	public phoneNumber: string | null = null;
	public photoURL: string | null = null;
	public uid: string | null = null;
	public credits: number = 0;
	public households: GObject = {};

	constructor(u: Ward = {} as Ward) {
		let {
			dateCreated = new Date(),
			lastUpdated = new Date(),
			displayName = null,
			email = null,
			emailVerified = null,
			phoneNumber = null,
			photoURL = null,
			credits = 0,
			uid = null,
		} = u

		this.dateCreated = new Date(dateCreated || new Date());
		this.lastUpdated = new Date(lastUpdated || new Date());
		this.displayName = displayName
		this.email = email
		this.emailVerified = emailVerified
		this.phoneNumber = phoneNumber
		this.photoURL = photoURL
		this.credits = credits
		this.uid = uid
	}

	static createNewWard(user: User, hhUid: string, userName: string): Ward {
		var newWard: Ward = new Ward()
		newWard.dateCreated = new Date()
		newWard.displayName = user.displayName || userName
		newWard.email = user.email
		newWard.emailVerified = user.emailVerified
		newWard.phoneNumber = user.phoneNumber
		newWard.photoURL = user.photoURL
		newWard.uid = user.uid
		newWard.addHousehold(hhUid)

		return newWard
	}

	public addHousehold(hhUid: string) {
		let tempHH = {
			...this.households
		}
		tempHH[hhUid] = true
		this.households = tempHH
	}

	public removeHousehold(hhUid: string) {
		delete this.households[hhUid]
	}

	public addCredits(reward: number) {
		this.credits = Number(this.credits) + Number(reward)
	}

	public subtractCredits(cost: number) {
		if (Number(this.credits) - Number(cost) < 0) {
			throw new Error("Credit would be negative")
		}

		this.credits = Number(this.credits) - Number(cost)
	}

	public prepareUserForSave(): any {
		return {
			...this,
			dateCreated: this.dateCreated ? this.dateCreated.toISOString() : new Date().toISOString(),
			lastUpdated: new Date().toISOString(),
		}
	}
}