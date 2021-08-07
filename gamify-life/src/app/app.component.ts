import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/store/app.state';
import { setUser } from 'src/store/user/user-auth.actions';
import { selectUser } from 'src/store/user/user-auth.selectors';
import { UserAuth } from './classes/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	constructor(public store: Store<AppState>, public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase) {}

	ngOnInit() {
		window.addEventListener('beforeunload', (e) => {
			this.store.pipe(select(selectUser)).subscribe(fetchedUser => {
				if (fetchedUser.uid) {
					sessionStorage.setItem('user', JSON.stringify(fetchedUser))
				}
			});
		});

		this.fireAuth.user.subscribe(user => {
			if (user) {
				this.fireDb.object(`guardians/${user.uid}`).valueChanges().subscribe((x:any) => {
					this.store.dispatch(setUser({ user: new UserAuth(x)}))
				})
			} else {
				var sessionUser = sessionStorage.getItem('user')
				if (sessionUser) {
					var loggedInUser = new UserAuth(JSON.parse(sessionUser))
					this.store.dispatch(setUser({ user: loggedInUser }))
				}
			}

			sessionStorage.removeItem('user')
		})
	}
}
