import { User } from '@firebase/auth-types'

export class Guardian {
	public dateCreated: Date | null = null;
	public lastUpdated: Date | null = null;
	public guardianPin: string | null = null;
	public displayName: string | null = null;
	public email: string | null = null;
	public emailVerified: boolean | null = null;
	public phoneNumber: string | null = null;
	public photoURL: string | null = null;
	public uid: string | null = null;
	public wards: Array<string> | null = null;

	constructor(u: Guardian = {} as Guardian) {
		let {
			dateCreated = new Date(),
			lastUpdated = new Date(),
			guardianPin = null,
			displayName = null,
			email = null,
			emailVerified = null,
			phoneNumber = null,
			photoURL = null,
			uid = null,
			wards = null
		} = u

		this.dateCreated = new Date(dateCreated || new Date());
		this.lastUpdated = new Date(lastUpdated || new Date());
		this.guardianPin = guardianPin
		this.displayName = displayName
		this.email = email
		this.emailVerified = emailVerified
		this.phoneNumber = phoneNumber
		this.photoURL = photoURL
		this.uid = uid
		this.wards = wards
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
		return {
			...this,
			dateCreated: this.dateCreated ? this.dateCreated.toISOString() : new Date().toISOString(),
			lastUpdated: this.lastUpdated ? this.lastUpdated.toISOString() : new Date().toISOString(),
		}
	}
}