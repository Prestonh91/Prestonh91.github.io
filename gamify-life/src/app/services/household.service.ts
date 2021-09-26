import { Injectable } from '@angular/core';
import { AngularFireDatabase, snapshotChanges } from '@angular/fire/database';
import { DataSnapshot } from '@angular/fire/database/interfaces';
import { Store } from '@ngrx/store';
import { from } from 'rxjs';
import { map, mergeAll, take, toArray } from 'rxjs/operators';
import { Guardian, Household, Quest } from 'src/app/classes';
import { AppState } from 'src/store/app.state';
import { setHousehold } from 'src/store/household/household.store';
import { Perk } from '../classes/Perk';
import { GuardianService } from './guardian.service';
import { PerkService } from './perk.service';
import { QuestService } from './quest.service';

@Injectable({
  providedIn: 'root'
})
export class HouseholdService {
	private readonly householdUrl = 'households/'

	private getHHUrl(hhUid: string): string {
		return this.householdUrl + hhUid!
	}

	constructor(
		private fireDb: AngularFireDatabase,
		private guardianService: GuardianService,
		private questService: QuestService,
		private perkService: PerkService,
		private store: Store<AppState>
	) { }

	//////////////////////////////////////////////////////
	// Getters
	//////////////////////////////////////////////////////

	getHouseholdObserver(uid: string) {
		return this.fireDb.object(this.getHHUrl(uid)).valueChanges()
	}

	async getHouseholdValue(uid: string) {
		return (await this.fireDb.database.ref(this.getHHUrl(uid)).once('value')).val()
	}

	getHouseholdPromise(uid: string) {
		return this.fireDb.database.ref(this.getHHUrl(uid)).once('value')
	}

	getHouseHolds(households: Object) {
		var hhFetchers = []

		for (var h of Object.keys(households)) {
			hhFetchers.push(this.fireDb.object(this.getHHUrl(h)).valueChanges())
		}

		return from(hhFetchers).pipe(
			mergeAll(),
			map((x:any) => new Household(x)),
			take(Object.keys(households).length),
			toArray(),
		)
	}

	/////////////////////////////////////////////////////////////
	// Saves
	/////////////////////////////////////////////////////////////

	voidSaveHousehold(hh: Household) {
		this.fireDb.object(this.getHHUrl(hh.uid!)).set(hh.prepareHouseholdForSave())
		this.store.dispatch(setHousehold({ household: hh }))
	}

	saveHousehold(hh: Household) {
		this.voidSaveHousehold(hh)
		return hh
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
		var res = await this.fireDb.object(this.getHHUrl(newHousehold.uid!)).set(newHousehold.prepareHouseholdForSave())
		return res
	}

	createNewQuest(quest: Quest) {
		// Save the quest which also gives us a UID
		quest = this.questService.createNewQuest(quest)

		// Fetch the household to add the new quest to it, save the household, update the store
		this.getHouseholdPromise(quest.household!).then(hh => {
			if (hh.val()) {
				let h = new Household(hh.val())
				h.addQuest(quest.uid!)
				this.voidSaveHousehold(h)
				this.store.dispatch(setHousehold({ household: h }))
			}
		})
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

	addQuestToHousehold(quest: Quest) {
		this.getHouseholdPromise(quest.household!).then((hhSnap: DataSnapshot) => {
			if (hhSnap.val()) {
				let hh = new Household(hhSnap.val())
				hh.addQuest(quest.uid!)
				this.voidSaveHousehold(hh)
			}
		})

		this.questService.voidSaveQuest(quest)
	}

	removeQuestFromHousehold(quest: Quest, household: Household) {
		household.removeQuest(quest.uid!)

		this.voidSaveHousehold(household)

		this.questService.deleteQuest(quest)
	}

	addPerkToHousehold(perk: Perk) {
		this.getHouseholdPromise(perk.household).then((snapShot: DataSnapshot) => {
			if (snapShot.exists()) {
				let hh = new Household(snapShot.val())
				hh.addPerk(perk.uid)
				this.voidSaveHousehold(hh)

				this.perkService.voidSavePerk(perk, hh.uid)
			}
		})
	}

	removePerksFromHousehold(perkList: Array<Perk>, household: Household) {
		let perkUidsToRemove = perkList.map(x => x.uid)
		household.removePerks(perkUidsToRemove)

		this.voidSaveHousehold(household)

		this.perkService.deletePerks(perkList)
	}

	createNewPerk(perk: Perk) {
		// Add the perk to the household
		perk = this.perkService.saveNewPerk(perk)

		// Fetch the household, update the household, and save the household
		this.getHouseholdPromise(perk.household).then(res => {
			if (res.val()) {
				let hh = new Household(res.val())
				hh.addPerk(perk.uid)
				this.voidSaveHousehold(hh)
			}
		})
	}
}
