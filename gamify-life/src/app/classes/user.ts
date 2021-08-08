import { User } from '@firebase/auth-types'

export class UserAuth {
	public dateCreated: Date | null = null;
	public lastUpdated: Date | null = null;
	public guardianPin: string | null = null;
	public guardianId: string | null = null;
	public displayName: string | null = null;
	public email: string | null = null;
	public emailVerified: boolean | null = null;
	public phoneNumber: string | null = null;
	public photoURL: string | null = null;
	public uid: string | null = null;

	constructor(u: UserAuth = {} as UserAuth) {
		let {
			dateCreated = new Date(),
			lastUpdated = new Date(),
			guardianPin = null,
			guardianId = null,
			displayName = null,
			email = null,
			emailVerified = null,
			phoneNumber = null,
			photoURL = null,
			uid = null,
		} = u

		this.dateCreated = new Date(dateCreated || new Date());
		this.lastUpdated = new Date(lastUpdated || new Date());
		this.guardianPin = guardianPin
		this.guardianId = guardianId
		this.displayName = displayName
		this.email = email
		this.emailVerified = emailVerified
		this.phoneNumber = phoneNumber
		this.photoURL = photoURL
		this.uid = uid
	}

	static createNewGuardian(user: User): UserAuth {
		var newUser: UserAuth = new UserAuth()
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

	static createNewWard(user: User, guardianId: string): UserAuth {
		var newWard: UserAuth = new UserAuth()
		newWard.dateCreated = new Date()
		newWard.guardianId = guardianId
		newWard.displayName = user.displayName
		newWard.email = user.email
		newWard.emailVerified = user.emailVerified
		newWard.phoneNumber = user.phoneNumber
		newWard.photoURL = user.photoURL
		newWard.uid = user.uid

		return newWard
	}

	prepareUserForSave(): any {
		return {
			...this,
			dateCreated: this.dateCreated ? this.dateCreated.toISOString() : new Date().toISOString(),
			lastUpdated: this.lastUpdated ? this.lastUpdated.toISOString() : new Date().toISOString(),
		}
	}
}