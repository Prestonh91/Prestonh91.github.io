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

	private getGuardianUrl(gUid: string) {
		return `${this.guardianURL}${gUid}`
	}

	constructor(private fireDb: AngularFireDatabase, private store: Store<AppState>) { }

	async getGuardianValue(uid: string) {
		let response = (await this.fireDb.database.ref(this.getGuardianUrl(uid)).once('value')).val()

		if (response)
			return new Guardian(response)

		return null
	}

	getGuardianPromise(uid: string) {
		return this.fireDb.database.ref(this.guardianURL + uid).once('value')
	}

	getGuardianObservable(uid: string) {
		return this.fireDb.object(this.guardianURL + uid).valueChanges()
	}

	voidSaveGuardian(g: Guardian, updateStore: boolean = false) {
		this.fireDb.database.ref(this.guardianURL + g.uid).set(g.prepareUserForSave()).then(x => {
			if (updateStore)
				this.store.dispatch(setGuardian({ guardian: g }))
		})
	}

	saveGuardian(g: Guardian) {
		return this.fireDb.database.ref(this.guardianURL + g.uid).set(g.prepareUserForSave())
	}

	updateGuardianHouseholds(g: Guardian, updates: any) {
		const url = this.getGuardianUrl(g.uid!)
		updates[`${url}/households`] = g.households
		updates[`${url}/lastUpdated`] = new Date()
	}
}
