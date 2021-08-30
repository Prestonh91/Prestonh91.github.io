import { User } from '@firebase/auth-types'

export class Ward {
	public dateCreated: Date | null = null;
	public lastUpdated: Date | null = null;
	public guardianId: string | null = null;
	public guardianUid: string | null = null;
	public displayName: string | null = null;
	public email: string | null = null;
	public emailVerified: boolean | null = null;
	public phoneNumber: string | null = null;
	public photoURL: string | null = null;
	public uid: string | null = null;
	public credits: number = 0;

	constructor(u: Ward = {} as Ward) {
		let {
			dateCreated = new Date(),
			lastUpdated = new Date(),
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
		this.guardianId = guardianId
		this.displayName = displayName
		this.email = email
		this.emailVerified = emailVerified
		this.phoneNumber = phoneNumber
		this.photoURL = photoURL
		this.uid = uid
	}

	static createNewWard(user: User, guardianId: string, guardianUid: string): Ward {
		var newWard: Ward = new Ward()
		newWard.dateCreated = new Date()
		newWard.guardianId = guardianId
		newWard.guardianUid = guardianUid
		newWard.displayName = user.displayName
		newWard.email = user.email
		newWard.emailVerified = user.emailVerified
		newWard.phoneNumber = user.phoneNumber
		newWard.photoURL = user.photoURL
		newWard.uid = user.uid

		return newWard
	}

	public prepareUserForSave(): any {
		return {
			...this,
			dateCreated: this.dateCreated ? this.dateCreated.toISOString() : new Date().toISOString(),
			lastUpdated: this.lastUpdated ? this.lastUpdated.toISOString() : new Date().toISOString(),
		}
	}
}