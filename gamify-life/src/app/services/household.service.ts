import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { forkJoin, from, of } from 'rxjs';
import { combineAll, exhaust, exhaustMap, map, mergeAll, take, tap, toArray } from 'rxjs/operators';
import { Guardian, Household, Quest } from 'src/app/classes';
import { GuardianService } from './guardian.service';

@Injectable({
  providedIn: 'root'
})
export class HouseholdService {
	private readonly householdUrl = 'households/'

	private getHHUrl(hh: Household): string {
		return this.householdUrl + hh.uid!
	}

	private updateHousehold(hh: Household, updates: any) {
		updates["/dateUpdated"] = new Date().toISOString()
		this.fireDb.object(this.getHHUrl(hh)).update(updates)
	}

	constructor(private fireDb: AngularFireDatabase, private guardianService: GuardianService) { }

	getHouseholdObserver(uid: string) {
		return this.fireDb.object(this.householdUrl + uid).valueChanges()
	}

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
		var guardian = new Guardian(await this.guardianService.getGuardianValue(guardianUid))

		// Create the new household, includes adding
		var newHousehold = Household.createNewHousehold(name, this.fireDb.createPushId(), guardian)

		// Add the new household to the guardians array
		guardian.addHousehold(newHousehold)

		// Update the guardian
		this.guardianService.voidSaveGuardian(guardian, true);

		// Save the household
		var res = await this.fireDb.object(this.householdUrl + newHousehold.uid).set(newHousehold.prepareHouseholdForSave())
		return res
	}

	async joinHousehold(hhUid: string, guardianUid: string) {
		// Fetch the guardian
		var guardian = new Guardian(await this.guardianService.getGuardianValue(guardianUid))

		// Fetch the household
		var hh = new Household(await this.getHouseholdValue(hhUid))

		// Add the guardian to the household and the household to the guardain
		hh.addGuardian(guardian)
		guardian.addHousehold(hh)

		await this.guardianService.voidSaveGuardian(guardian, true)
		await this.voidSaveHousehold(hh);
		return true
	}

	removeQuestFromHousehold(quest: Quest, household: Household) {
		delete household.quests[quest.uid!]

		if (!Object.keys(household.quests).includes(quest.uid!)) {
			var updates: any = {}
			updates["/quests"] = household.quests
			this.updateHousehold(household, updates)
		}
	}
}
