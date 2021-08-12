import { createAction, props } from "@ngrx/store";
import { Guardian } from "src/app/classes/Guardian";

export const setUser = createAction(
	'Set User',
	props<{ user: Guardian }>()
);

export const clearUser = createAction(
	'Clear User',
	props<{ user: Guardian }>()
);

