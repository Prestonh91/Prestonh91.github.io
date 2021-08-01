import { createReducer, on } from "@ngrx/store";

import { clearUser, setUser } from "./user-auth.actions";
import { UserAuth } from "src/app/classes/user";

export const initialState: Readonly<UserAuth> = new UserAuth();

export const userReducer = createReducer(
	initialState,
	on(setUser, (state, props) => {
		return props.user
	}),
	on(clearUser, (state) => new UserAuth())
)