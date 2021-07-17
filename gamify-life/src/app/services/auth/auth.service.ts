import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { User } from 'src/app/classes/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private baseURL = "/guardian/";

constructor(public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase) { }

registerGuardian(email: string, password: string) {
	this.fireAuth.createUserWithEmailAndPassword(email, password).then(res => {
		if (res && res.user) {
			var newUser = new User().createNewUser(res.user.uid);
			this.fireDb.object(this.baseURL + res.user.uid).set(newUser);
		}
	})
}

}
