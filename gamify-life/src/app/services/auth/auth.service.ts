import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngrx/store';
import { APIErrorResponse } from 'src/app/classes/apiErrorResponse';
import { Guardian } from 'src/app/classes/Guardian';
import { Ward } from 'src/app/classes/Ward';
import { setError } from 'src/store/api/api.store';
import { map, take, tap } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
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

	async registerGuardian(email: string, password: string): Promise<Observable<Guardian | boolean>> {
		try {
			var res = await this.fireAuth.createUserWithEmailAndPassword(email, password)

			if (res?.user) {
				var newUser: Guardian = Guardian.createNewGuardian(res.user);
				this.fireDb.object(this.guardianUrl + res.user.uid).set(newUser.prepareUserForSave()).then(() =>{
					this.store.dispatch(setGuardian({ guardian: newUser}))
				});
				this.fireDb.object(this.guardianPinUrl + newUser.guardianPin).set(newUser.uid)
				return from([newUser])
			}

			return from([false])
		} catch (e) {
			this.store.dispatch(setError({error: new APIErrorResponse().setError(e)}))
			return from([false])
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
					return from([newUser])
				}

			}
			return from([false])
		} catch (e: any) {
			this.store.dispatch(setError({error: new APIErrorResponse().setError(e)}))
			return from([false])
		}
	}

	async loginGuardian(email: string, password: string) {
		try {
			var response = await this.fireAuth.signInWithEmailAndPassword(email, password)

			return this.fireDb.object(this.guardianUrl + response.user?.uid).valueChanges().pipe(
				map((user: any) => {
					if (user) {
						this.store.dispatch(setGuardian({ guardian: new Guardian(user)}))
					}

					return user
				})
			)
		} catch (e) {
			var apiError = new APIErrorResponse()
			apiError.setError(e)
			this.store.dispatch(setError({error: apiError}))
			return from([false])
		}
	}

	async loginWard(email: string, password: string) {
		try {
			var loginResponse = await this.fireAuth.signInWithEmailAndPassword(email, password);

			return this.fireDb.object(this.wardUrl + loginResponse.user?.uid).valueChanges().pipe(
				take(1),
				tap((x: any) => {
					if (x) {
						this.store.dispatch(setWard({ ward: new Ward(x)}))
					}
				})
			)

		} catch (e) {
			this.store.dispatch(setError({ error: new APIErrorResponse().setError(e)}))
			return from([false])
		}
	}
}
