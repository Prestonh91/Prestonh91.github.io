import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DataSnapshot } from '@angular/fire/database/interfaces';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/store/app.state';
import { setWard } from 'src/store/ward/ward.store';
import { Ward } from '../classes';

@Injectable({
  providedIn: 'root'
})
export class WardService {
	private wardURL = "wards/"

	constructor(private fireDb: AngularFireDatabase, private store: Store<AppState>) { }

	async getWardValue(wUid: string): Promise<Ward | null> {
		return (await this.fireDb.database.ref(this.wardURL + wUid).once('value')).val()
	}

	getWardPromise(wUid: string): Promise<DataSnapshot> {
		return this.fireDb.database.ref(this.wardURL + wUid).once('value')
	}

	getWardObservable(wUid: string): Observable<unknown> {
		return this.fireDb.object(this.wardURL + wUid).valueChanges()
	}

	voidSaveWard(ward: Ward, updateStore = false): void {
		this.fireDb.database.ref(this.wardURL + ward.uid).set(ward.prepareUserForSave()).then(() => {
			if (updateStore) {
				this.store.dispatch(setWard({ ward: ward }))
			}
		})
	}
}
