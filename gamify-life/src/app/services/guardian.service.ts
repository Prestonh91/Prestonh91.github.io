import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngrx/store';
import { AppState } from 'src/store/app.state';
import { setGuardian } from 'src/store/guardian/guardian.store';
import { Guardian } from '../classes';

@Injectable({
  providedIn: 'root'
})
export class GuardianService {
	private readonly guardianURL = 'guardians/'

	constructor(private fireDb: AngularFireDatabase, private store: Store<AppState>) { }

	async getGuardian(uid: string) {
		return (await this.fireDb.database.ref(this.guardianURL + uid).once('value')).val()
	}

	voidSaveGuardian(g: Guardian) {
		this.fireDb.database.ref(this.guardianURL + g.uid).set(g.prepareUserForSave()).then(x => {
			this.store.dispatch(setGuardian({ guardian: g }))
		})
	}

	saveGuardian(g: Guardian) {
		return this.fireDb.database.ref(this.guardianURL + g.uid).set(g.prepareUserForSave()).then(x => {
			this.store.dispatch(setGuardian({ guardian: g }))
		})
	}
}
