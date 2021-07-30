import { User } from '@firebase/auth-types'

export class UserAuth {
	public dateCreated: Date | null = null;
	public lastUpdated: Date | null = null;
	public guardianPin: string | null = null;
	public user: User | null = null;

	constructor(u: UserAuth = {} as UserAuth) {
		let {
			dateCreated = new Date(),
			lastUpdated = new Date(),
			guardianPin = null,
		} = u

		this.dateCreated = new Date(dateCreated || new Date());
		this.lastUpdated = new Date(lastUpdated || new Date());
		this.guardianPin = guardianPin
		debugger
	}

	static createNewUser(user: User): UserAuth {
		var newUser: UserAuth = new UserAuth()
		newUser.dateCreated = new Date();
		newUser.guardianPin = user.uid.substr(2, 6).toUpperCase();
		newUser.user = user
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