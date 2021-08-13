import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngrx/store';
import { APIErrorResponse } from 'src/app/classes/apiErrorResponse';
import { Guardian } from 'src/app/classes/Guardian';
import { Ward } from 'src/app/classes/Ward';
import { setError } from 'src/store/api/api.store';
import { setUser } from 'src/store/user/user-auth.actions';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private guardianUrl = "guardians/";
	private guardianPinUrl = "guardianPins/"
	private wardUrl = "wards/";

	constructor(public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase, private store: Store<{ user: Guardian}>) { }

	registerGuardian(email: string, password: string) {
		this.fireAuth.createUserWithEmailAndPassword(email, password).then(res => {
			if (res && res.user) {
				var newUser: Guardian = Guardian.createNewGuardian(res.user);
				this.fireDb.object(this.guardianUrl + res.user.uid).set(newUser.prepareUserForSave()).then(() => this.store.dispatch(setUser({ user: newUser})));
				this.fireDb.object(`${this.guardianPinUrl}${newUser.guardianPin}`).set(newUser.uid)
			}
		}).catch(err => {
			this.store.dispatch(setError({error: new APIErrorResponse().setError(err)}))
		})
	}

	async registerWard(email: string, password: string, guardianId: string) {
		try {
			var guardianKeyRes = await this.fireDb.object('guardianPins').query.orderByKey().equalTo(guardianId.toUpperCase()).get()
			var guardianKey = guardianKeyRes.val()

			if (guardianKey[guardianId]) {
				var userRes = await this.fireAuth.createUserWithEmailAndPassword(email, password)

				if (userRes.user !== null) {
					this.fireDb.object(this.guardianUrl + guardianKey[guardianId]).query.once('value').then(x => {
						if (x.val()) {
							const wardsGuardian = new Guardian(x.val())
							wardsGuardian.addWardToGuardian(userRes?.user?.uid || "")
							this.fireDb.object(this.guardianUrl + guardianKey[guardianId]).set(wardsGuardian.prepareUserForSave())
						}
					})

					var newUser: Ward = Ward.createNewWard(userRes.user, guardianId);
					this.fireDb.object(`${this.wardUrl}${userRes.user.uid}`).set(newUser.prepareUserForSave());
				}
			}
		} catch (e: any) {
			var apiError = new APIErrorResponse()
			apiError.setError(e)
			this.store.dispatch(setError({error: apiError}))
		}
	}

	async loginUser(email: string, password: string) {
		try {
			var response = await this.fireAuth.signInWithEmailAndPassword(email, password)

			return await this.fireDb.object(`guardians/${response.user?.uid}`).valueChanges().pipe(
				map((user: any) => {
					if (user) {
						this.store.dispatch(setUser({ user: new Guardian(user)}))
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
}
