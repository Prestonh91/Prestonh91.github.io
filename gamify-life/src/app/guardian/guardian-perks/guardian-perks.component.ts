import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatabaseSnapshot } from '@angular/fire/database/interfaces';
import { FormControl } from '@angular/forms';
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
	public get filteredPerks(): Array<Perk> {
		if (!this.sortSelection.value) return this.perks

		return this.perks.filter(x => x.household === this.sortSelection.value)
	}

	sortOptions: any[] = []
	sortSelection: FormControl = new FormControl()

	perkSelections: Array<Perk> = new Array()
	perkToEdit: Perk = new Perk()

	guardianSub = new Subscription()
	perkSub = new Subscription()
	hhSub = new Subscription()
	sortSub = new Subscription()

	constructor(
		private store: Store<AppState>,
		private perkService: PerkService,
		private hhService: HouseholdService,
	) { }

	ngOnInit(): void {
		this.guardianSub = this.store.pipe(select(selectGuardian)).subscribe((g: Readonly<Guardian>) => {
			this.perkSub = this.perkService.getGuardianPerks(g.households).subscribe((hhPerksSnapshot: DatabaseSnapshot<unknown>) => {
				var hhPerks: Array<Perk> = []
				let data: any = hhPerksSnapshot.val()

				if (data) {
					for (let p of Object.keys(data)) {
						hhPerks.push(new Perk(data[p]))
					}
				}

				let currentHousehold = hhPerksSnapshot.key
				let newPerkUids = hhPerks.map((x: any) => x.uid)

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
			this.households = []
			for (let hh of hhs) {
				this.households.push(new Household(hh))
				this.sortOptions.push({ value: hh.uid, display: hh.name })
			}
		})

		UIkit.util.on('#editPerk', 'hide', () => { this.perkToEdit = new Perk() })

		// this.sortSub = this.sortSelection.valueChanges.subscribe(x => {
		// 	debugger
		// 	this.filteredPerks = this.perks.filter(x => x.uid === this)
		// })
	}

	ngOnDestroy(): void {
		this.perkSub.unsubscribe()
		this.guardianSub.unsubscribe()
		this.hhSub.unsubscribe()
		this.sortSub.unsubscribe()
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

	editPerk() {
		this.perkToEdit = this.perkSelections[0]
		this.perkSelections = []
		UIkit.modal('#editPerk').show()
	}

	purchasePerksForWard() {}

	deletePerks() {
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

		this.perkSelections = []
	}
}
