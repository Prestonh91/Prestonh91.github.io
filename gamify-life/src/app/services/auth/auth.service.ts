import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngrx/store';
import { APIErrorResponse } from 'src/app/classes/apiErrorResponse';
import { UserAuth } from 'src/app/classes/user';
import { setError } from 'src/store/api/api.store';
import { setUser } from 'src/store/user/user-auth.actions';
import { filter, map, tap } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private guardianUrl = "guardians/";
	private wardUrl = "wards/";

	constructor(public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase, private store: Store<{ user: UserAuth}>) { }

	registerGuardian(email: string, password: string) {
		this.fireAuth.createUserWithEmailAndPassword(email, password).then(res => {
			if (res && res.user) {
				var newUser: UserAuth = UserAuth.createNewGuardian(res.user);
				this.fireDb.object(this.guardianUrl + res.user.uid).set(newUser.prepareUserForSave()).then(() => this.store.dispatch(setUser({ user: newUser})));
			}
		})
	}

	registerWard(email: string, password: string, guardianId: string) {
		return this.fireDb.object('guardians/').valueChanges().pipe(
			map((g: any) => {
				var guardian: UserAuth | null = null
				Object.keys(g).forEach(x => {
					if (g[x]?.guardianPin === guardianId)
						guardian = g[x]
				})

				if (guardian)
					return guardian
				else
					return false
			}),
			tap(x => {
				if (x) {
					this.fireAuth.createUserWithEmailAndPassword(email, password).then(res => {
						if (res && res.user) {
							var newUser: UserAuth = UserAuth.createNewWard(res.user, guardianId);
							this.fireDb.object(`${this.wardUrl}${res.user.uid}`).set(newUser.prepareUserForSave()).then(() => this.store.dispatch(setUser({ user: newUser })))
						}
					}).catch(e => {
						var apiError = new APIErrorResponse()
						this.store.dispatch(setError({error: apiError.setError(e)}))
					})
				} else {
					var e: APIErrorResponse = new APIErrorResponse()
					this.store.dispatch(setError({ error: e.setError({ code: 'auth/guardian-does-not-exist' }) }))
				}
			})
		).subscribe(x => {
			debugger
		})

		// .subscribe((guardians: any) => {
		// 	var guardianExists: boolean = false
		// 	Object.keys(guardians).forEach(g => {
		// 		if (guardians[g]?.guardianPin === guardianId) {
		// 			guardianExists = true
		// 		}
		// 	})

		// 	if (!guardianExists) {
		//
		// 	} else {

		// 	}
		// })
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
