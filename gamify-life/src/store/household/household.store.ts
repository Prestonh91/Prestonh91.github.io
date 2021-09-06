import { createAction, createReducer, createSelector, on, props } from "@ngrx/store";
import { Household } from "src/app/classes";
import { AppState } from "../app.state";

export const initialState: Readonly<Array<Household>> = new Array<Household>();

export const setHouseholds = createAction(
	'Set Households',
	props<{ households: Array<Household> }>()
)

export const setHousehold = createAction(
	'Set Household',
	props<{ household: Household }>()
)

export const clearHouseholds = createAction(
	'Clear Households',
)

export const householdReducer = createReducer(
	initialState,
	on(setHouseholds, (state, props) => props.households),
	on(setHousehold, (state, props) => {
		var tempHHs = []
		for (let h of state) {
			if (h.uid !== props.household.uid) {
				tempHHs.push(h)
			} else {
				tempHHs.push(props.household)
			}
		}
		return tempHHs
	}),
	on(clearHouseholds, (state) => new Array())
)

export const getHouseholds = createSelector(
	(state: AppState) => state.households,
	(households: ReadonlyArray<Household>) => households,
)

export const getHousehold = (hUid: string) => {
	return createSelector(
		getHouseholds,
		(households: ReadonlyArray<Household>) => households.find(x => x.uid === hUid)
	)
}