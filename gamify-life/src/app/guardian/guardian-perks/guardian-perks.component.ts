import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Guardian, Household } from 'src/app/classes';
import { Perk } from 'src/app/classes/Perk';
import { HouseholdService } from 'src/app/services/household.service';
import { PerkService } from 'src/app/services/perk.service';
import { AppState } from 'src/store/app.state';
import { selectGuardian } from 'src/store/guardian/guardian.store';
import { getHouseholds } from 'src/store/household/household.store';
declare var UIkit: any;

@Component({
	selector: 'app-guardian-perks',
	templateUrl: './guardian-perks.component.html',
	styleUrls: ['./guardian-perks.component.scss'],
})
export class GuardianPerksComponent implements OnInit, OnDestroy {
	households: Array<Household> = new Array()
	perks: Array<Perk> = new Array()
	perkSelections: Array<Perk> = new Array()

	guardianSub = new Subscription()
	perkSub = new Subscription()
	hhSub = new Subscription()

	constructor(
		private store: Store<AppState>,
		private perkService: PerkService,
		private hhService: HouseholdService,
	) { }

	ngOnInit(): void {
		this.guardianSub = this.store.pipe(select(selectGuardian)).subscribe((g: Readonly<Guardian>) => {
			this.perkSub = this.perkService.getGuardianPerks(g.households).subscribe((hhPerks: Array<Perk>) => {
				let currentHousehold = hhPerks[0].household
				let newPerkUids = hhPerks.map(x => x.uid)

				for (let perk of hhPerks) {
					let existingPerkUid = this.perks.findIndex(x => x.uid === perk.uid)
					if (existingPerkUid > -1) {
						this.perks.splice(existingPerkUid, 1, perk)
					} else {
						this.perks.push(perk)
					}
				}

				this.perks = new Array(...this.perks.filter(p => {
					return p.household === currentHousehold ?
						newPerkUids.includes(p.uid) :
						true
				}))
			})
		})
		this.hhSub = this.store.pipe(select(getHouseholds)).subscribe((hhs: ReadonlyArray<Household>) => {
			for (let h of hhs) {
				let hh = new Household(h)

				let existingHH = this.households.findIndex(x => x.uid ===  hh.uid)
				if (existingHH > -1) {
					this.households.splice(existingHH, 1, hh)
				} else {
					this.households.push(hh)
				}
			}
		})
	}

	ngOnDestroy(): void {
		this.perkSub.unsubscribe()
		this.guardianSub.unsubscribe()
	}

	addNewPerk() {
		UIkit.modal('#createPerk').show()
	}

	toggleSelectPerk(perk: Perk) {
		let isPerkSelected = this.perkSelections.findIndex(x => x.uid === perk.uid)
		if (isPerkSelected > -1) {
			this.perkSelections.splice(isPerkSelected, 1)
		} else {
			this.perkSelections.push(perk)
		}
	}

	isPerkSelected(perk: Perk): boolean {
		return !!this.perkSelections.find(x => x.uid === perk.uid)
	}

	editQuest() {}

	purchaseQuestsForWard() {}

	deleteQuests() {
		var uniqueHHs: Array<string> = []

		// Get an array of unique household uids
		for (let p of this.perkSelections) {
			if (!uniqueHHs.includes(p.household)) {
				uniqueHHs.push(p.household)
			}
		}

		// Loop over the unique HH uids
		for (let hhUid of uniqueHHs) {
			// Get all the perks in our selection pertaining to the HH interation
			let hhPerks = this.perkSelections.filter(x => x.household == hhUid)

			// Get the HH we are currently looking at
			let hh = this.households.find(x => x.uid === hhUid)

			// Remove the perks from that HH
			if (hh && hhPerks.length) {
				this.hhService.removePerksFromHousehold(hhPerks, hh)
			}
		}
	}
}
