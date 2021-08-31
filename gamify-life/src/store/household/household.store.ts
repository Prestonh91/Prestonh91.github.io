import { createAction, createReducer, createSelector, on, props } from "@ngrx/store";
import { Household } from "src/app/classes";
import { AppState } from "../app.state";

export const initialState: Readonly<Array<Household>> = new Array<Household>();

export const setHouseholds = createAction(
	'Set Households',
	props<{ households: Array<Household> }>()
)

export const clearHouseholds = createAction(
	'Clear Households',
)

export const householdReducer = createReducer(
	initialState,
	on(setHouseholds, (state, props) => props.households),
	on(clearHouseholds, (state) => new Array())
)

export const getHouseholds = createSelector(
	(state: AppState) => state.households,
	(households: ReadonlyArray<Household>) => households,
)