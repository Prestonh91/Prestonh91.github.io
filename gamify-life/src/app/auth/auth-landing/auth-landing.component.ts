import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';


@Component({
  selector: 'app-auth-landing',
  templateUrl: './auth-landing.component.html',
  styleUrls: ['./auth-landing.component.scss']
})
export class AuthLandingComponent implements OnInit {

  constructor(public fireAuth: AngularFireAuth, public fireDB: AngularFireDatabase) { 

  }

  ngOnInit() {
	this.fireAuth.createUserWithEmailAndPassword('preston.higgins91@gmail.com', 'somesecurepass').then(user => {
		if (user && user.user) {
			const parent: any = {}
			parent[user.user.uid] = true
			this.fireDB.object('parents').set(parent)
		} 
	});
  }

}
