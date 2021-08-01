import { createSelector, createReducer, on, createAction, props } from "@ngrx/store";
import { APIErrorResponse } from "src/app/classes/apiErrorResponse";
import { AppState } from "../app.state";

// Initial State
export const initiaState: Readonly<APIErrorResponse> = new APIErrorResponse();

// Actions
export const setError = createAction(
	'Set API Error',
	props<{ error: APIErrorResponse}>()
)

export const clearError = createAction(
	'Clear API Error'
)

// Reducers
export const apiErrorReducer = createReducer(
	initiaState,
	on(setError, (state, { error }) => error),
	on(clearError, () => new APIErrorResponse()),
)

// Selectors
export const getError = createSelector(
	(state: AppState) => state.error,
	(error: Readonly<APIErrorResponse>) => error
)