import { APIErrorResponse } from "src/app/classes/apiErrorResponse";
import { UserAuth } from "src/app/classes/user";

export interface AppState {
	user: Readonly<UserAuth>;
	error: Readonly<APIErrorResponse>;
}