import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatabaseSnapshot } from '@angular/fire/database/interfaces';
import { FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Guardian, Household, Ward } from 'src/app/classes';
import { Perk } from 'src/app/classes/Perk';
import { HouseholdService } from 'src/app/services/household.service';
import { PerkService } from 'src/app/services/perk.service';
import { WardService } from 'src/app/services/ward.service';
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
	households: Array<Household> = new Array();
	perks: Array<Perk> = new Array();
	filteredPerks: Array<Perk> = new Array();
	wards: Array<Ward> = new Array();

	filterOptions: any[] = [];
	wardPurchaseOptions: any[] = [];
	filterSelection: FormControl = new FormControl();
	purchaseForSelection: FormControl = new FormControl();
	wardSelectedForRedeem: Ward = new Ward();

	perkSelections: Array<Perk> = new Array();
	perkToEdit: Perk = new Perk();
	perksToRedeem: Array<Perk> = new Array();

	guardianSub = new Subscription();
	perkSub = new Subscription();
	hhSub = new Subscription();
	filterSub = new Subscription();
	purchaseForSub = new Subscription();

	constructor(
		private store: Store<AppState>,
		private perkService: PerkService,
		private hhService: HouseholdService,
		private wardService: WardService,
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
				this.filteredPerks = this.perks
			})
		})
		this.hhSub = this.store.pipe(select(getHouseholds)).subscribe((hhs: ReadonlyArray<Household>) => {
			this.households = []

			for (let hh of hhs) {
				this.households.push(new Household(hh))
				this.filterOptions.push({ value: hh.uid, display: hh.name })
				this.wardService.getListOfWardsValue(Object.keys(hh.wards)).then((wards: Ward[]) => {
					for (let ward of wards) {
						if (!this.wards.find(x => x.uid === ward.uid)) {
							this.wards.push(new Ward(ward))
							this.wardPurchaseOptions.push({ value: ward.uid, display: ward.displayName })
						}
					}
				})
			}
		})

		this.filterSub = this.filterSelection.valueChanges.subscribe(x => this.handleFilterPerks())
		this.purchaseForSub = this.purchaseForSelection.valueChanges.subscribe(x => this.handleFilterPerks())

		UIkit.util.on('#editPerk', 'hide', () => { this.perkToEdit = new Perk() })
		UIkit.util.on('#perkRedeem', 'hide', () => { this.perksToRedeem = [] })
	}

	ngOnDestroy(): void {
		this.perkSub.unsubscribe();
		this.guardianSub.unsubscribe();
		this.hhSub.unsubscribe();
		this.filterSub.unsubscribe();
		this.purchaseForSub.unsubscribe();
	}

	addNewPerk() {
		UIkit.modal('#createPerk').show()
	}

	handleFilterPerks() {
		if (this.purchaseForSelection.value) {
			this.wardSelectedForRedeem = new Ward(this.wards.find(x => x.uid === this.purchaseForSelection.value))
		} else {
			this.wardSelectedForRedeem = new Ward()
		}

		if (!this.filterSelection.value && !this.purchaseForSelection.value) {
			this.filteredPerks = this.perks
			return
		}

		let hhs = this.households.map(x => {
			if (this.filterSelection.value && this.purchaseForSelection.value) {
				if (x.uid === this.filterSelection.value && !!x.wards[this.purchaseForSelection.value])
					return x.uid
			} else if (this.filterSelection.value) {
				if (x.uid === this.filterSelection.value)
					return x.uid
			} else if (this.purchaseForSelection.value) {
				if (!!x.wards[this.purchaseForSelection.value])
					return x.uid
			}

			return null
		}).filter(x => x)

		this.filteredPerks = this.perks.filter(x => hhs.includes(x.household))
		this.clearFilteredSelectedPerks()
	}

	clearAllFilters() {
		this.purchaseForSelection.reset()
		this.filterSelection.reset()
		this.perkSelections = []
		this.wardSelectedForRedeem = new Ward()
	}

	clearFilteredSelectedPerks() {
		let reverseIndices = Object.keys(this.perkSelections).sort((a, b) =>  Number(b) - Number(a))
		for (let i of reverseIndices) {
			if (this.filteredPerks.findIndex(x => x.uid === this.perkSelections[Number(i)].uid) === -1) {
				this.perkSelections.splice(Number(i), 1)
			}
		}
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

	purchasePerksForWard() {
		this.perksToRedeem = this.perkSelections
		UIkit.offcanvas('#perkRedeem').show()
	}

	deletePerks() {
		UIkit.modal.confirm("Are you sure you want to delete the selected perk(s)?").then(() => {
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
		}, () => {})
	}

	getWardDisplayName(uid: string) {
		return this.wards.find(x => x.uid === uid)?.displayName
	}
}
