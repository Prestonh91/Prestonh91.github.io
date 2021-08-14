import { createAction, props, createSelector, createReducer, on } from "@ngrx/store";
import { Guardian } from "src/app/classes/Guardian";
import { AppState } from "../app.state";

export const setGuardian = createAction(
	'Set Guardian',
	props<{ guardian: Guardian }>()
);

export const clearGuardian = createAction(
	'Clear Guardian',
	props<{ guardian: Guardian }>()
)

export const initialState: Readonly<Guardian> = new Guardian();

export const guardianReducer = createReducer(
	initialState,
	on(setGuardian, (state, props) => {
		return props.guardian
	}),
	on(clearGuardian, (state) => new Guardian())
)

export const selectgaurdian = createSelector(
	(state: AppState) => state.guardian,
	(guardian: Readonly<Guardian>) => guardian,
);

