import { createReducer, on, Action } from "@ngrx/store";

import { clearUser, setUser } from "./user-auth.actions";
import { UserAuth } from "src/app/classes/user";

export const initalState: Readonly<UserAuth> = new UserAuth();

export const userReducer = createReducer(
	initalState,
	on(setUser, (state, props) => {
		debugger
		return props.user
	}),
	on(clearUser, (state) => new UserAuth())
)