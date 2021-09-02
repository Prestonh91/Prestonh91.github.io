import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { forkJoin, from, of } from 'rxjs';
import { combineAll, exhaust, exhaustMap, map, mergeAll, take, tap, toArray } from 'rxjs/operators';
import { Guardian, Household } from 'src/app/classes';
import { GuardianService } from './guardian.service';

@Injectable({
  providedIn: 'root'
})
export class HouseholdService {
	private readonly householdUrl = 'households/'

	constructor(private fireDb: AngularFireDatabase, private guardianService: GuardianService) { }

	async getHouseholdValue(uid: string) {
		return (await this.fireDb.database.ref(this.householdUrl + uid).once('value')).val()
	}

	getHousehouldPromise(uid: string) {
		return this.fireDb.database.ref(this.householdUrl + uid).once('value')
	}

	getHouseHolds(households: Object) {
		var hhFetchers = []

		for (var h of Object.keys(households)) {
			hhFetchers.push(this.fireDb.object(this.householdUrl + h).valueChanges())
		}

		return from(hhFetchers).pipe(
			mergeAll(),
			map((x:any) => new Household(x)),
			take(Object.keys(households).length),
			toArray(),
		)
	}

	voidSaveHousehold(hh: Household) {
		this.fireDb.object(this.householdUrl + hh.uid).set(hh.prepareHouseholdForSave())
	}

	async createNewHousehold(name: string, guardianUid: string) {
		// Get the guardian
		var guardian = new Guardian(await this.guardianService.getGuardian(guardianUid))

		// Create the new household, includes adding
		var newHousehold = Household.createNewHousehold(name, this.fireDb.createPushId(), guardian)

		// Add the new household to the guardians array
		guardian.addHousehold(newHousehold)

		// Update the guardian
		this.guardianService.voidSaveGuardian(guardian);

		// Save the household
		var res = await this.fireDb.object(this.householdUrl + newHousehold.uid).set(newHousehold.prepareHouseholdForSave())
		return res
	}

	async joinHousehold(hhUid: string, guardianUid: string) {
		// Fetch the guardian
		var guardian = new Guardian(await this.guardianService.getGuardian(guardianUid))

		// Fetch the household
		var hh = new Household(await this.getHouseholdValue(hhUid))


		// Add the guardian to the household and the household to the guardain
		hh.addGuardian(guardian)
		guardian.addHousehold(hh)

		await this.guardianService.voidSaveGuardian(guardian)
		await this.voidSaveHousehold(hh);
		return true
	}
}
