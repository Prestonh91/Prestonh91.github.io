import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/store/app.state';
import { selectGuardian, setGuardian } from 'src/store/guardian/guardian.store';
import { selectWard, setWard } from 'src/store/ward/ward.store';
import { Guardian } from './classes/Guardian';
import { Ward } from './classes/Ward';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	constructor(public store: Store<AppState>, public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase) {}

	ngOnInit() {
		window.addEventListener('beforeunload', (e) => {
			this.store.pipe(select(selectGuardian)).subscribe(fetchedUser => {
				if (fetchedUser.uid) {
					sessionStorage.setItem('guardian', JSON.stringify(fetchedUser))
				}
			});
			this.store.pipe(select(selectWard)).subscribe(fetchedUser => {
				if (fetchedUser.uid) {
					sessionStorage.setItem('ward', JSON.stringify(fetchedUser))
				}
			})
		});


		this.fireAuth.user.subscribe(user => {
			if (user) {
				this.fireDb.object(`guardians/${user.uid}`).valueChanges().subscribe((x:any) => {
					if (x)
						this.store.dispatch(setGuardian({ guardian: new Guardian(x)}))
				})
				this.fireDb.object(`wards/${user.uid}`).valueChanges().subscribe((x:any) => {
					if (x)
						this.store.dispatch(setWard({ ward: new Ward(x)}))
				})
			} else {
				var sessionGuardian = sessionStorage.getItem('guardian')
				if (sessionGuardian) {
					let loggedInUser = new Guardian(JSON.parse(sessionGuardian))
					this.store.dispatch(setGuardian({ guardian: loggedInUser }))
				}

				var sessionWard = sessionStorage.getItem('ward')
				if (sessionWard) {
					let loggedInUser = new Ward(JSON.parse(sessionWard))
					this.store.dispatch(setWard({ ward: loggedInUser }))
				}
			}

			sessionStorage.removeItem('guardian')
			sessionStorage.removeItem('ward')
		})

		this
	}
}
