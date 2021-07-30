import { createAction, props } from "@ngrx/store";
import { UserAuth } from "src/app/classes/user";

export const setUser = createAction(
	'Set User',
	props<{ user: UserAuth }>()
);

export const clearUser = createAction(
	'Clear User',
	props<{ user: UserAuth }>()
);

