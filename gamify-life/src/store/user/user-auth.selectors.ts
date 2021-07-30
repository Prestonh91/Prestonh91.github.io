import { createSelector, createFeatureSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { UserAuth } from "src/app/classes/user";

export const selectUser = createSelector(
	(state: AppState) => state.user,
	(user: Readonly<UserAuth>) => user,
);

export const selectUserState = createFeatureSelector<AppState, Readonly<UserAuth>>("user");

