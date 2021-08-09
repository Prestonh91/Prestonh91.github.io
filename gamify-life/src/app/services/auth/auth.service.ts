import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngrx/store';
import { APIErrorResponse } from 'src/app/classes/apiErrorResponse';
import { UserAuth } from 'src/app/classes/user';
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

	constructor(public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase, private store: Store<{ user: UserAuth}>) { }

	registerGuardian(email: string, password: string) {
		this.fireAuth.createUserWithEmailAndPassword(email, password).then(res => {
			if (res && res.user) {
				var newUser: UserAuth = UserAuth.createNewGuardian(res.user);
				this.fireDb.object(this.guardianUrl + res.user.uid).set(newUser.prepareUserForSave()).then(() => this.store.dispatch(setUser({ user: newUser})));
				this.fireDb.object(`${this.guardianPinUrl}${newUser.guardianPin}`).set(newUser.uid)
			}
		})
	}

	async registerWard(email: string, password: string, guardianId: string) {
		try {
			var guardianKeyRes = await this.fireDb.object('guardianPins').query.orderByKey().equalTo(guardianId.toUpperCase()).get()
			var guardianKey = guardianKeyRes.val()

			if (guardianKey) {
				var userRes = await this.fireAuth.createUserWithEmailAndPassword(email, password)

				if (userRes.user) {
					var newUser: UserAuth = UserAuth.createNewWard(userRes.user, guardianId);
					this.fireDb.object(`${this.wardUrl}${userRes.user.uid}`).set(newUser.prepareUserForSave()).then(() => this.store.dispatch(setUser({ user: newUser})));
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
						this.store.dispatch(setUser({ user: new UserAuth(user)}))
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
