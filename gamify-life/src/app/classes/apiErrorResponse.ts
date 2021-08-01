export class APIErrorResponse {
	code: string | null = null;
	apiMessage: string | null = null;
	uiMessage: string | null = null;

	constructor() {}

	setError(error: any) {
		this.code = error.code
		this.apiMessage = error.message
		this.transformApiMessage()
	}

	transformApiMessage() {
		switch (this.code) {
			case 'auth/user-not-found':
			case 'auth/wrong-password':
				this.uiMessage = "User email was not found or the password was incorrect"
				break;
			case 'auth/too-many-requests':
				this.uiMessage = this.apiMessage
		}
	}
}