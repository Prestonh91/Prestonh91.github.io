import { Injectable } from '@angular/core';
import { AngularFireDatabase, snapshotChanges } from '@angular/fire/database';
import { DataSnapshot } from '@angular/fire/database/interfaces';
import { Store } from '@ngrx/store';
import { from } from 'rxjs';
import { map, mergeAll, take, toArray } from 'rxjs/operators';
import { Guardian, Household, Quest, Ward } from 'src/app/classes';
import { AppState } from 'src/store/app.state';
import { setHousehold } from 'src/store/household/household.store';
import { Perk } from '../classes/Perk';
import { GuardianService } from './guardian.service';
import { PerkService } from './perk.service';
import { QuestService } from './quest.service';
import { TransactionService } from './transaction.service';
import { WardService } from './ward.service';

@Injectable({
  providedIn: 'root'
})
export class HouseholdService {
	private readonly householdUrl = 'households/'

	private getHHUrl(hhUid: string): string {
		return this.householdUrl + hhUid!
	}

	private getHHPerksUrl(hhUid: string) {
		return `${this.getHHUrl(hhUid)}/perks`
	}

	private getHHDateUpdatedUrl(hhUid: string) {
		return `${this.getHHUrl(hhUid)}/dateUpdated`
	}

	constructor(
		private fireDb: AngularFireDatabase,
		private guardianService: GuardianService,
		private questService: QuestService,
		private perkService: PerkService,
		private wardService: WardService,
		private transactionService: TransactionService,
		private store: Store<AppState>
	) { }

	//////////////////////////////////////////////////////
	// Getters
	//////////////////////////////////////////////////////

	getHouseholdObserver(uid: string) {
		return this.fireDb.object(this.getHHUrl(uid)).valueChanges()
	}

	async getHouseholdValue(uid: string): Promise<Household | null> {
		const results = (await this.fireDb.database.ref(this.getHHUrl(uid)).once('value')).val()

		if (results)
			return new Household(results)

		return null
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
		var hh = await this.getHouseholdValue(hhUid)

		if (hh === null)
			throw new Error("Household service: Join Household household is null")

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

	redeemPerks(ward: Ward, perks: Array<Perk>, perkRedeemAmounts: any) {
		let total = perks.map(x => perkRedeemAmounts[x.uid] * x.cost).reduce((prev, accum) => prev + accum, 0)
		let wardToUse = new Ward(ward)
		wardToUse.subtractCredits(total)

		this.wardService.voidSaveWard(wardToUse)

		for (let p of perks) {
			let amount = Number(perkRedeemAmounts[p.uid])
			let remainingDurability = p.durability - amount

			if (remainingDurability === 0) {
				this.getHouseholdPromise(p.household).then(snapshot => {
					if (snapshot.val()) {
						let hh = new Household(snapshot.val())
						this.removePerksFromHousehold([p], hh)
					}
				})
			} else {
				p.removeDurability(amount)
				this.perkService.voidSavePerk(p, p.household)
			}
		}
	}

	async redeemPerksTest(ward: Ward, perks: Array<Perk>, perkRedeemAmounts: any) {
		// An object to hold the updates to be sent to the DB
		let updates: any = {}

		// Get the total amount of credits this is going to cost
		let total = perks.map(x => perkRedeemAmounts[x.uid] * x.cost).reduce((prev, accum) => prev + accum, 0)

		// Grab the ward to get the most up to date version
		let wardToUpdate = await this.wardService.getWardValue(ward.uid!)

		// If the ward doesn't exist Uh-Oh
		if (wardToUpdate === null)
			throw new Error("Household Service: Redeem Perks ward is null")

		// Subtract the credits from the ward, will throw if the credits will go negative
		wardToUpdate.subtractCredits(total)

		// Add the updates for the ward to the updates object
		this.wardService.updateWardCredis(wardToUpdate, updates)

		// Loop over the perks and subtract the durability from them, delete them if their durability is zero
		for (let p of perks) {
			// If the perk has unlimited uses skip doing anything to this perk
			if (p.hasUnlimited) continue

			// Get how much durability to remove
			let amount = Number(perkRedeemAmounts[p.uid])

			// Get the updated perk
			let freshPerk = await this.perkService.getPerkValue(p.uid!, p.household)

			if (freshPerk === null)
				throw new Error("Household Service: Redeem Perks perk is null")

			// Create a transaction to record this redemption
			var perkTransaction = this.transactionService.createPerkTransaction(freshPerk.cost, freshPerk.title!, wardToUpdate.uid!)

			// Add the transaction to the updates object
			this.transactionService.updateSaveTransaction(perkTransaction, updates)

			// Subtract the amount used from the durability, this will throw if durability will be negative
			freshPerk.removeDurability(amount)

			if (freshPerk.durability === 0) {
				// Get the fresh household
				let hh = await this.getHouseholdValue(p.household)

				if (hh === null)
					throw new Error("Household Service: Redeem Perks household is null")

				// Remove the perk from the household
				hh.removePerk(freshPerk.uid!)

				// Add the updated household perk list to the updates object
				this.updateHHPerks(hh, updates)

				// Null out the perk on the updates object to remove it from the db
				this.perkService.updateRemovePerk(freshPerk, updates)
			} else {
				// Add the perks updated durability to the updates object
				this.perkService.updatePerkDurability(freshPerk, updates)
			}
		}

		// Fire off the update to finalize everything
		this.fireDb.database.ref().update(updates)
	}

	public updateHHPerks(hh: Household, updates: any) {
		updates[this.getHHPerksUrl(hh.uid!)] = hh.perks
		updates[this.getHHDateUpdatedUrl(hh.uid!)] = new Date().toISOString()
	}
}
