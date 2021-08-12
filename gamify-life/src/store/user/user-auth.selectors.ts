import { createSelector, createFeatureSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { Guardian } from "src/app/classes/Guardian";

export const selectUser = createSelector(
	(state: AppState) => state.user,
	(user: Readonly<Guardian>) => user,
);

export const selectUserState = createFeatureSelector<AppState, Readonly<Guardian>>("user");

