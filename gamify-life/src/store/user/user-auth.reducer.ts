import { createReducer, on } from "@ngrx/store";

import { clearUser, setUser } from "./user-auth.actions";
import { Guardian } from "src/app/classes/Guardian";

export const initialState: Readonly<Guardian> = new Guardian();

export const userReducer = createReducer(
	initialState,
	on(setUser, (state, props) => {
		return props.user
	}),
	on(clearUser, (state) => new Guardian())
)