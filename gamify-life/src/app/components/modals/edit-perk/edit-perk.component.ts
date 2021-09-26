import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { Household } from 'src/app/classes';
import { Perk } from 'src/app/classes/Perk';
import { HouseholdService } from 'src/app/services/household.service';
import { PerkService } from 'src/app/services/perk.service';
import { AppState } from 'src/store/app.state';
import { getHouseholds } from 'src/store/household/household.store';
declare var UIkit: any;

@Component({
  selector: 'edit-perk',
  templateUrl: './edit-perk.component.html',
  styleUrls: ['./edit-perk.component.scss']
})
export class EditPerkComponent implements OnInit, OnChanges {
	@Input() perk: Perk = new Perk();
	public mutablePerk: FormGroup = this.resetPerk()

	public householdOptions: any[] = []
	public hhs: ReadonlyArray<Household> = []
	public isDurabilityDisabled: boolean = false
	private originalHHUid: string = ""

	public get hasUnlimitedHasError(): boolean {
		if (this.mutablePerk.value?.durability) return false
		return (this.mutablePerk.get('hasUnlimited')?.touched === true) && (this.mutablePerk.get('hasUnlimited')?.invalid === true)
	}

	public get durabilityHasError(): boolean {
		if (this.mutablePerk.value?.hasUnlimited !== null) return false
		return (this.mutablePerk.get('durability')?.touched === true) && (this.mutablePerk.get('durability')?.invalid === true)
	}

	hhSub = new Subscription();

	constructor(
		private fb: FormBuilder,
		private store: Store<AppState>,
		private hhService: HouseholdService,
		private perkService: PerkService,
	) { }

	ngOnInit(): void {
		this.store.pipe(select(getHouseholds), filter((x: any) => x.length), first()).subscribe((hhs: ReadonlyArray<Household>) => {
			this.hhs = hhs
			this.householdOptions = hhs.map(hh => {
				return {
					value: hh.uid,
					display: hh.name
				}
			})
		})
	}

	ngOnChanges(): void {
		if (this.perk.uid) {
			this.setPerk()
			this.originalHHUid = this.perk.household
		}
	}

	resetForm() {
		this.mutablePerk = this.resetPerk()
		this.isDurabilityDisabled = false
	}

	resetPerk(): FormGroup {
		return this.fb.group({
			title: [null, Validators.required],
			description: [null, Validators.required],
			cost: [null, Validators.required],
			durability: [null, Validators.required],
			hasUnlimited: [null, Validators.required],
			household: [null, Validators.required],
			dateCreated: null,
			dateUpdated: null,
			dateAccepted: null,
			uid: null,
		})
	}

	setPerk() {
		this.mutablePerk.setValue({
			title: this.perk.title,
			description: this.perk.description,
			cost: this.perk.cost,
			durability: this.perk.durability || null,
			hasUnlimited: this.perk.hasUnlimited,
			household: this.perk.household,
			dateCreated: this.perk.dateCreated,
			dateUpdated: this.perk.dateUpdated,
			dateAccepted: this.perk.dateAccepted,
			uid: this.perk.uid,
		})
		this.isDurabilityDisabled = this.perk.hasUnlimited
	}

	handleCheckUnlimited() {
		var hasUnlimited = this.mutablePerk.get('hasUnlimited')?.value

		if (hasUnlimited) {
			this.mutablePerk.get('durability')?.reset()
		}

		this.isDurabilityDisabled = hasUnlimited
	}

	handleDurabilityInput() {
		this.mutablePerk.get('hasUnlimited')?.reset()
	}

	savePerk() {
		const {
			title,
			cost,
			description,
			household,
			durability,
			hasUnlimited
		} = this.mutablePerk.controls

		if (
			title.invalid ||
			cost.invalid ||
			description.invalid ||
			household.invalid ||
			(durability.invalid && hasUnlimited.invalid)
		) {
			this.mutablePerk.markAllAsTouched()
			return
		}

		let perkToSave = new Perk(this.mutablePerk.value)

		if (this.originalHHUid !== perkToSave.household) {
			let originalHH = new Household(this.hhs.find(x => x.uid === this.originalHHUid))
			this.hhService.removePerksFromHousehold([this.perk], originalHH)
			this.hhService.addPerkToHousehold(perkToSave)
		} else {
			this.perkService.voidSavePerk(perkToSave)
		}

		UIkit.modal("#editPerk").hide()
	}
}
