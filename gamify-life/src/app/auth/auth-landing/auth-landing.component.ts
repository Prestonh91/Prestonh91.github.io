import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { User } from 'src/app/classes/user';


@Component({
  selector: 'app-auth-landing',
  templateUrl: './auth-landing.component.html',
  styleUrls: ['./auth-landing.component.scss']
})
export class AuthLandingComponent implements OnInit {

  constructor(public fireAuth: AngularFireAuth, public fireDB: AngularFireDatabase) { 

  }

  ngOnInit() {
	// this.fireAuth.createUserWithEmailAndPassword('preston.higgins91@gmail.com', 'somesecurepass').then(user => {
	// 	if (user && user.user) {
	// 		const parent: any = {};
	// 		parent[user.user.uid] = { verified : true };
	// 		const url = '/parent/' + user.user.uid
	// 		const newUser = new User();
	// 		const data = {
	// 			...newUser,
	// 			dateCreated: newUser.dateCreated?.toISOString(),
	// 			lastUpdated: newUser.lastUpdated ? newUser.lastUpdated.toISOString() : new Date().toISOString(),
	// 		}
	// 		debugger
	// 		this.fireDB.object(url).set(data).then(u => console.log(u));
	// 	} 
	// });
  }

}
