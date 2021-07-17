import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { UserAuth } from 'src/app/classes/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private baseURL = "/guardians/";

	constructor(public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase) { }

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
}
