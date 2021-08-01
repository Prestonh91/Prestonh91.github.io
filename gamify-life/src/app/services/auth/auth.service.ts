import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngrx/store';
import { APIErrorResponse } from 'src/app/classes/apiErrorResponse';
import { UserAuth } from 'src/app/classes/user';
import { setError } from 'src/store/api/api.store';
import { setUser } from 'src/store/user/user-auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private baseURL = "/guardians/";

	constructor(public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase, private store: Store<{ user: UserAuth}>) { }

	registerGuardian(email: string, password: string) {
		this.fireAuth.createUserWithEmailAndPassword(email, password).then(res => {
			if (res && res.user) {
				var newUser: UserAuth = UserAuth.createNewUser(res.user);
				this.fireDb.object(this.baseURL + res.user.uid).set(newUser.prepareUserForSave()).then(() => this.store.dispatch(setUser({ user: newUser})));
			}
		})
	}

	loginUser(email: string, password: string) {
		this.fireAuth.signInWithEmailAndPassword(email, password).then(res => {
			debugger
			if (res?.user) {
				this.fireDb.object('guardians/' + res.user.uid).valueChanges().subscribe((action: any) => {
					if (action) {
						var loggedInUser: UserAuth = new UserAuth(action)
						this.store.dispatch(setUser({ user: loggedInUser}))
					}
				})
			}

			if (res?.credential) {
			}
		}).catch(err => {
			var apiError = new APIErrorResponse()
			apiError.setError(err)
			this.store.dispatch(setError({error: apiError}))
		})
	}
}
