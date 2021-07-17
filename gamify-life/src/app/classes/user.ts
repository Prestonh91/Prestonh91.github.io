export class User {
	public dateCreated: Date | null = null;
	public lastUpdated: Date | null = null;
	public guardianPin: string | null = null;

	constructor(u: User = {} as User) {
		let {
			dateCreated = new Date(),
			lastUpdated = new Date(),
			guardianPin = null,
		} = u

		this.dateCreated = dateCreated;
		this.lastUpdated = lastUpdated;
		this.guardianPin = guardianPin
	}

	createNewUser(uid: string): void {
		this.dateCreated = new Date();
		this.guardianPin = uid.substr(2, 6);
	}

	prepareUserForSave(): any {
		return {
			...this,
			dateCreated: this.dateCreated ? this.dateCreated.toISOString() : new Date().toISOString(),
			lastUpdated: this.lastUpdated ? this.lastUpdated.toISOString() : new Date().toISOString(),
		}
	}
}