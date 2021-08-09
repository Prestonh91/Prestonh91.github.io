export class APIErrorResponse {
	code: string | null = null;
	apiMessage: string | null = null;
	uiMessage: string | null = null;

	constructor() {}

	setError(error: any): APIErrorResponse {
		this.code = error.code
		this.apiMessage = error.message
		this.transformApiMessage()
		return this
	}

	transformApiMessage() {
		debugger
		switch (this.code) {
			case 'auth/user-not-found':
			case 'auth/wrong-password':
				this.uiMessage = "User email was not found or the password was incorrect"
				break;
			case 'auth/too-many-requests':
				this.uiMessage = this.apiMessage
				break;
			case 'auth/guardian-does-not-exist':
				this.uiMessage = 'Could not find a Guardian with the given pin. Please confirm the pin is correct and try again'
				break
			case 'auth/weak-password':
				this.uiMessage = "The password is too weak!"
				break
			case "auth/email-already-in-use":
				this.uiMessage = "This email is already in use"
				break
			default:
				this.uiMessage = 'Oh uh! Something went wrong!'
		}
	}
}