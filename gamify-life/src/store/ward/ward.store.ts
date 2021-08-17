import { createAction, createReducer, createSelector, on, props } from "@ngrx/store";
import { Ward } from "src/app/classes/Ward";
import { AppState } from "../app.state";
import { clearGuardian } from "../guardian/guardian.store";

export const initialState: Readonly<Ward> = new Ward();

export const setWard = createAction(
	'Set Ward',
	props<{ ward: Ward }>()
);

export const clearWard = createAction(
	'Clear Ward',
	props<{ ward: Ward }>()
)

export const wardReducer = createReducer(
	initialState,
	on(setWard, (state, props) => {
		return props.ward
	}),
	on(clearGuardian, (state) => new Ward())
)

export const selectWard = createSelector(
	(state: AppState) => state.ward,
	(ward: Readonly<Ward>) => ward,
)