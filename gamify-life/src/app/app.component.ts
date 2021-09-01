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
		this.fireAuth.user.subscribe(user => {
			if (user) {
				this.fireDb.object(`guardians/${user.uid}`).query.once('value').then(x => {
					if (x.val())
						this.store.dispatch(setGuardian({ guardian: new Guardian(x.val()) }))
				})
				this.fireDb.object(`wards/${user.uid}`).query.once('value').then(x => {
					if (x.val())
						this.store.dispatch(setWard({ ward: new Ward(x.val()) }))
				})
			}
		})
	}
}
