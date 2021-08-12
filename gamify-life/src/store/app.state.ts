import { APIErrorResponse } from "src/app/classes/apiErrorResponse";
import { Guardian } from "src/app/classes/Guardian";

export interface AppState {
	user: Readonly<Guardian>;
	error: Readonly<APIErrorResponse>;
}