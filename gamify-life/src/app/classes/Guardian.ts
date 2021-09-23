import { User } from '@firebase/auth-types'
import { Household } from './Household';

interface GObject {
	[key: string]: any,
}
export class Guardian {
	public dateCreated: Date | null = null;
	public lastUpdated: Date | null = null;
	public guardianPin: string | null = null;
	public households: GObject = new Array<Household>()
	public displayName: string | null = null;
	public email: string | null = null;
	public emailVerified: boolean | null = null;
	public phoneNumber: string | null = null;
	public photoURL: string | null = null;
	public uid: string | null = null;

	constructor(u: Guardian = {} as Guardian) {
		let {
			dateCreated = new Date(),
			lastUpdated = new Date(),
			guardianPin = null,
			displayName = null,
			households = new Array<Household>(),
			email = null,
			emailVerified = null,
			phoneNumber = null,
			photoURL = null,
			uid = null,
		} = u

		this.dateCreated = new Date(dateCreated || new Date());
		this.lastUpdated = new Date(lastUpdated || new Date());
		this.guardianPin = guardianPin
		this.displayName = displayName
		this.email = email
		this.households = households
		this.emailVerified = emailVerified
		this.phoneNumber = phoneNumber
		this.photoURL = photoURL
		this.uid = uid
	}

	static createNewGuardian(user: User): Guardian {
		var newUser: Guardian = new Guardian()
		newUser.dateCreated = new Date();
		newUser.guardianPin = user.uid.substr(2, 6).toUpperCase();
		newUser.displayName = user.displayName
		newUser.email = user.email
		newUser.emailVerified = user.emailVerified
		newUser.phoneNumber = user.phoneNumber
		newUser.photoURL = user.photoURL
		newUser.uid = user.uid

		return newUser
	}

	prepareUserForSave(): any {
		const requestData = {
			...this,
			dateCreated: this.dateCreated ? this.dateCreated.toISOString() : new Date().toISOString(),
			lastUpdated: new Date().toISOString(),
		}

		this.lastUpdated = requestData.lastUpdated

		return requestData
	}

	addHousehold(household: Household) {
		this.households[household.uid || ''] = true
	}

	removeHousehold(household: Household) {
		delete this.households[household.uid || '']
	}
}