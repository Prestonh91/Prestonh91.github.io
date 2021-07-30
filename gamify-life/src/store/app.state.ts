import { UserAuth } from "src/app/classes/user";

export interface AppState {
	user: Readonly<UserAuth>;
}