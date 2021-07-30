import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngrx/store';
import { UserAuth } from 'src/app/classes/user';
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
				this.fireDb.object(this.baseURL + res.user.uid).set(this.setupUserForSave(newUser));
			}
		})
	}

	setupUserForSave(user: UserAuth): {} {
		return {
			guardianPin: user.guardianPin,
			dateCreated: user.dateCreated?.valueOf(),
			lastUpdated:user.lastUpdated ? user.lastUpdated.valueOf() : Date.now(),
		}
	}

	loginUser(email: string, password: string) {
		this.fireAuth.signInWithEmailAndPassword(email, password).then(res => {
			if (res?.user) {
				console.log('user', res.user)
				this.fireDb.object('guardians/' + res.user.uid).valueChanges().subscribe((action: any) => {
					if (action) {
						var newUser: UserAuth = new UserAuth(action)
						// newUser.user = res.user
						this.store.dispatch(setUser({ user: newUser}))
					}
				})
			}

			if (res?.credential) {
				console.log('cred' , res.credential)
			}
		})
	}
}
