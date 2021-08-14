import { createAction, createReducer, on, props } from "@ngrx/store";
import { Ward } from "src/app/classes/Ward";
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