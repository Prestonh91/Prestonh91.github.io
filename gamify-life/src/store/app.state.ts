import { Household } from "src/app/classes";
import { APIErrorResponse } from "src/app/classes/apiErrorResponse";
import { Guardian } from "src/app/classes/Guardian";
import { Ward } from "src/app/classes/Ward";

export interface AppState {
	guardian: Readonly<Guardian>;
	ward: Readonly<Ward>;
	error: Readonly<APIErrorResponse>;
	households: ReadonlyArray<Household>;
}