import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { from, Observable, of } from 'rxjs';
import { filter, map, mergeMap, pairwise } from 'rxjs/operators';
import { Household } from '../classes';
import { Perk } from '../classes/Perk';

@Injectable({
  providedIn: 'root'
})
export class PerkService {
	private perkUrl = "perks/"

	public getPerkContainerUrl(hhUid: string): string {
		return `${this.perkUrl}${hhUid}`
	}

	public getPerkUrl(pUid: string, hhUid: string): string {
		return `${this.perkUrl}${hhUid}/${pUid}`
	}

	public getPerkDurabilityUrl(pUid: string, hhUid: string): string {
		return `${this.getPerkUrl(pUid, hhUid)}/durability`
	}

	public getPerkDateUpdatedUrl(pUid: string, hhUid: string): string {
		return `${this.getPerkUrl(pUid, hhUid)}/dateUpdated`
	}

	private validatePerkRequest(householdUid: string | null = null, hh: Household | null = null): string {
		var hhUid = hh !== null ? hh.uid : householdUid

		if (hhUid === null) {
			throw new Error("Perk Service: A household ID is required to save a perk")
		}

		return hhUid
	}

	constructor(
		private fireDb: AngularFireDatabase,
	) {}

	voidSavePerk(p: Perk, householdUid: string | null = null, hh: Household | null = null) {
		var hhUid = this.validatePerkRequest(householdUid, hh)

		this.fireDb.object(this.getPerkUrl(p.uid, hhUid)).set(p.prepareForSave())
	}

	getPerkObservable(pUid: string, householdUid: string | null = null, hh: Household | null = null): Observable<Perk | null> {
		var hhUid = this.validatePerkRequest(householdUid, hh)

		return this.fireDb.object(this.getPerkUrl(pUid, hhUid)).valueChanges().pipe(
			map((x: any) => {
				if (x)
					return new Perk(x)
				else
					return null
			})
		)
	}

	async getPerkValue(pUid: string, householdUid: string | null = null, hh: Household | null = null): Promise<Perk | null> {
		var hhUid = this.validatePerkRequest(householdUid, hh)

		let results = (await this.fireDb.database.ref(this.getPerkUrl(pUid, hhUid)).once('value')).val()

		if (results !== null)
			return new Perk(results)

		return null
	}

	getGuardianPerks(households: Object) {
		var perkFetchers = []

		for (let hh of Object.keys(households)) {
			perkFetchers.push(this.fireDb.object(this.getPerkContainerUrl(hh)).snapshotChanges())
		}

		return from(perkFetchers).pipe(
			// Get the inner observable
			mergeMap(x => x),
			// Get the payload of the snapshotChanges
			map(x => x.payload)
		)
	}

	saveNewPerk(perk: Perk): Perk {
		// Get a new Uid
		let perkRef = this.fireDb.database.ref(this.getPerkContainerUrl(perk.household)).push()

		// Set the new Uid to the perk
		perk.uid = perkRef.key!

		// Save the perk
		perkRef.set(perk.prepareForSave())

		return perk
	}

	deletePerks(perkList: Array<Perk>) {
		// An updates object to allow us to delete multiple quests at once
		var updates: any = {}

		for (let p of perkList) {
			// Validate to make sure each perk has a household
			this.validatePerkRequest(p.household)

			// Build the update url and assign the perk to null
			updates[this.getPerkUrl(p.uid, p.household)] = null
		}

		// Grab the base DB ref as each update has the whole path to the perk
		this.fireDb.object('/').update(updates)
	}

	public updatePerkDurability(perk: Perk, updates: any) {
		updates[this.getPerkDurabilityUrl(perk.uid!, perk.household)] = perk.durability
		updates[this.getPerkDateUpdatedUrl(perk.uid!, perk.household)] = new Date().toISOString()
	}

	public updateRemovePerk(perk: Perk, updates: any) {
		updates[this.getPerkUrl(perk.uid!, perk.household)] = null
	}
}
