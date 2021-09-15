import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Household } from '../classes';
import { Perk } from '../classes/Perk';
import { HouseholdService } from './household.service';

@Injectable({
  providedIn: 'root'
})
export class PerkService {
	private perkUrl = "perks/"

	private getPerkUrl(pUid: string, hhUid: string): string {
		return `${this.perkUrl}${hhUid}/${pUid}`
	}

	private getPerkContainerUrl(hhUid: string): string {
		return `${this.perkUrl}${hhUid}`
	}

	private validatePerkRequest(householdUid: string | null = null, hh: Household | null = null): string {
		var hhUid = householdUid || hh?.uid!

		if (hhUid === null) {
			throw new Error("Perk Service: A household ID is required to save a perk")
		}

		return hhUid
	}

	constructor(
		private fireDb: AngularFireDatabase,
		private hhService: HouseholdService,
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

		return (await this.fireDb.database.ref(this.getPerkUrl(pUid, hhUid)).once('value')).val()
	}

	saveNewPerk(perk: Perk) {
		// Get a new Uid
		let perkRef = this.fireDb.database.ref(this.getPerkContainerUrl(perk.household)).push()

		// Set the new Uid to the perk
		perk.uid = perkRef.key!

		// Add the perk to the household
		this.hhService.addPerkToHousehold(perk)

		// Save the perk
		perkRef.set(perk.prepareForSave())
	}
}
