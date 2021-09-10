import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DataSnapshot } from '@angular/fire/database/interfaces';
import { Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { map, mergeMap, take, toArray } from 'rxjs/operators';
import { AppState } from 'src/store/app.state';
import { setWard } from 'src/store/ward/ward.store';
import { Quest, Ward } from '../classes';

@Injectable({
  providedIn: 'root'
})
export class WardService {
	private wardURL = "wards/"

	constructor(private fireDb: AngularFireDatabase, private store: Store<AppState>) { }

	async getWardValue(wUid: string): Promise<Ward | null> {
		var response = (await this.fireDb.database.ref(this.wardURL + wUid).once('value')).val()

		if (response)
			return new Ward(response)

		return null
	}

	getWardPromise(wUid: string): Promise<DataSnapshot> {
		return this.fireDb.database.ref(this.wardURL + wUid).once('value')
	}

	getWardObservable(wUid: string): Observable<Ward> {
		return this.fireDb.object(this.wardURL + wUid).valueChanges().pipe(
			map((x: any) => new Ward(x))
		)
	}

	voidSaveWard(ward: Ward, updateStore = false): void {
		this.fireDb.database.ref(this.wardURL + ward.uid).set(ward.prepareUserForSave()).then(() => {
			if (updateStore) {
				this.store.dispatch(setWard({ ward: ward }))
			}
		})
	}

	getListOfWardsObservable(wards: Array<string>) {
		return from(wards).pipe(
			mergeMap(x => {
				return this.getWardObservable(x)
			}),
			take(wards.length),
			toArray()
		)
	}

	async getListOfWardsValue(wards: Array<string>) {
		let wardsValue: Array<Ward> = []

		for (let w of wards) {
			let ward = await this.getWardValue(w)
			if (ward)
				wardsValue.push(ward)
		}

		return wardsValue
	}

	async awardWardReward(quest: Quest) {
		let ward = await this.getWardValue(quest.assignee!)

		if (ward) {
			let reward: number = quest.reward ? quest.reward : 0
			ward.addCredits(reward)
			this.voidSaveWard(ward)
		}
	}
}
