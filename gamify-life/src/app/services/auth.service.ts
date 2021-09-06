import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngrx/store';
import { Guardian, Ward, APIErrorResponse, Household} from 'src/app/classes';
import { setError } from 'src/store/api/api.store';
import { setGuardian } from 'src/store/guardian/guardian.store';
import { setWard } from 'src/store/ward/ward.store';
import { GuardianService } from './guardian.service';
import { HouseholdService } from './household.service';
import { WardService } from './ward.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private wardUrl = "wards/";

	constructor(public fireAuth: AngularFireAuth,
		public fireDb: AngularFireDatabase,
		private store: Store<{ user: Guardian}>,
		private hhService: HouseholdService,
		private guardianService: GuardianService,
		private wardService: WardService,
	) { }

	async registerGuardian(email: string, password: string): Promise<Guardian | boolean> {
		try {
			// Create the guardian using firebase auth
			var res = await this.fireAuth.createUserWithEmailAndPassword(email, password)

			if (res?.user) {
				// Create the new guardian
				var newUser: Guardian = Guardian.createNewGuardian(res.user);
				// Save the guardian to the DB, update the store
				this.guardianService.voidSaveGuardian(newUser, true)
				return newUser
			}

			return false
		} catch (e) {
			this.store.dispatch(setError({error: new APIErrorResponse().setError(e)}))
			return false
		}
	}

	async loginGuardian(email: string, password: string) {
		try {
			// Log in the user via firebase
			var response = await this.fireAuth.signInWithEmailAndPassword(email, password)

			// Get the guardian from the DB, update the guardian in the store
			var user = await this.guardianService.getGuardianValue(response.user!.uid!)
			if (user) {
				this.store.dispatch(setGuardian({ guardian: new Guardian(user) }))
			}

			return user
		} catch (e) {
			var apiError = new APIErrorResponse()
			apiError.setError(e)
			this.store.dispatch(setError({error: apiError}))
			return false
		}
	}

	async registerWard(email: string, password: string, householdId: string) {
		try {
			// Create the user in the firebase auth
			var userRes = await this.fireAuth.createUserWithEmailAndPassword(email, password)

			if (userRes.user !== null) {
				// Grab the househod to add the ward to it
				var household = await this.hhService.getHouseholdValue(householdId)

				// Save the household
				if (household) {
					var hh = new Household(household)
					hh.addWard(userRes?.user?.uid)
					this.hhService.voidSaveHousehold(hh)
				}

				// Create the new ward
				var newUser: Ward = Ward.createNewWard(userRes.user, householdId);

				// Save the ward, update the store with the new ward
				this.wardService.voidSaveWard(newUser, true)
				return newUser
			}

			return false
		} catch (e: any) {
			this.store.dispatch(setError({error: new APIErrorResponse().setError(e)}))
			return false
		}
	}

	async loginWard(email: string, password: string) {
		try {
			// Login in the user via firebase
			var loginResponse = await this.fireAuth.signInWithEmailAndPassword(email, password);

			// Get the user from the DB, update the store
			let user = await this.wardService.getWardValue(loginResponse.user!.uid!)
			if (user) {
				this.store.dispatch(setWard({ ward: new Ward(user) }))
			}

			return user
		} catch (e) {
			this.store.dispatch(setError({ error: new APIErrorResponse().setError(e)}))
			return false
		}
	}
}
