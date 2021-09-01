import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngrx/store';
import { Guardian, Ward, APIErrorResponse} from 'src/app/classes';
import { setError } from 'src/store/api/api.store';
import { map, take, tap } from 'rxjs/operators';
import { from } from 'rxjs';
import { setGuardian } from 'src/store/guardian/guardian.store';
import { setWard } from 'src/store/ward/ward.store';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private guardianUrl = "guardians/";
	private guardianPinUrl = "guardianPins/"
	private wardUrl = "wards/";

	constructor(public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase, private store: Store<{ user: Guardian}>) { }

	async registerGuardian(email: string, password: string): Promise<Guardian | boolean> {
		try {
			var res = await this.fireAuth.createUserWithEmailAndPassword(email, password)

			if (res?.user) {
				var newUser: Guardian = Guardian.createNewGuardian(res.user);
				this.fireDb.object(this.guardianUrl + res.user.uid).set(newUser.prepareUserForSave()).then(() =>{
					this.store.dispatch(setGuardian({ guardian: newUser}))
				});
				this.fireDb.object(this.guardianPinUrl + newUser.guardianPin).set(newUser.uid)
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
			var response = await this.fireAuth.signInWithEmailAndPassword(email, password)
			var user = await this.fireDb.object(this.guardianUrl + response.user?.uid).query.once('value')

			if (user.val()) {
				this.store.dispatch(setGuardian({ guardian: new Guardian(user.val()) }))
			}

			return user.val()
		} catch (e) {
			var apiError = new APIErrorResponse()
			apiError.setError(e)
			this.store.dispatch(setError({error: apiError}))
			return false
		}
	}

	async registerWard(email: string, password: string, guardianId: string) {
		try {
			var guardianKeyRes = await this.fireDb.object('guardianPins').query.orderByKey().equalTo(guardianId.toUpperCase()).get()
			var guardianKey = guardianKeyRes.val()

			if (guardianKey[guardianId]) {
				var userRes = await this.fireAuth.createUserWithEmailAndPassword(email, password)

				if (userRes.user !== null) {
					var wardsGuardianRes = await this.fireDb.object(this.guardianUrl + guardianKey[guardianId]).query.once('value')

					if (wardsGuardianRes.val()) {
						var g = new Guardian(wardsGuardianRes.val())
						g.addWardToGuardian(userRes?.user?.uid || "")
						this.fireDb.object(this.guardianUrl + guardianKey[guardianId]).set(g.prepareUserForSave())
					}

					var newUser: Ward = Ward.createNewWard(userRes.user, guardianId, guardianKey[guardianId]);
					this.fireDb.object(`${this.wardUrl}${userRes.user.uid}`).set(newUser.prepareUserForSave());
					this.store.dispatch(setWard({ ward: newUser }))
					return newUser
				}

			}
			return false
		} catch (e: any) {
			this.store.dispatch(setError({error: new APIErrorResponse().setError(e)}))
			return false
		}
	}

	async loginWard(email: string, password: string) {
		try {
			var loginResponse = await this.fireAuth.signInWithEmailAndPassword(email, password);

			var userSnap = await this.fireDb.object(this.wardUrl + loginResponse.user?.uid).query.once('value')
			if (userSnap.val()) {
				this.store.dispatch(setWard({ ward: new Ward(userSnap.val())}))
			}

			return userSnap.val()
		} catch (e) {
			this.store.dispatch(setError({ error: new APIErrorResponse().setError(e)}))
			return false
		}
	}
}
