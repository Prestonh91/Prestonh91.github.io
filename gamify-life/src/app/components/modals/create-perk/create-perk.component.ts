import { Component, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Household } from 'src/app/classes';
import { Perk } from 'src/app/classes/Perk';
import { HouseholdService } from 'src/app/services/household.service';
import { PerkService } from 'src/app/services/perk.service';
import { AppState } from 'src/store/app.state';
import { getHouseholds } from 'src/store/household/household.store';
declare var UIkit: any;

@Component({
  selector: 'create-perk',
  templateUrl: './create-perk.component.html',
  styleUrls: ['./create-perk.component.scss']
})
export class CreatePerkComponent implements OnInit {
	perk: FormGroup = this.newPerk()
	hhOptions: any[] = [];
	isDurabilityDisabled: boolean = false;

	householdSubscription = new Subscription();

	public get hasUnlimitedHasError(): boolean {
		if (this.perk.value?.durability) return false
		return (this.perk.get('hasUnlimited')?.touched === true) && (this.perk.get('hasUnlimited')?.invalid === true)
	}

	public get durabilityHasError(): boolean {
		if (this.perk.value?.hasUnlimited !== null) return false
		return (this.perk.get('durability')?.touched === true) && (this.perk.get('durability')?.invalid === true)
	}

	constructor(
		private fb: FormBuilder,
		private store: Store<AppState>,
		private hhService: HouseholdService
	) { }

	ngOnInit(): void {
		this.householdSubscription = this.store.pipe(select(getHouseholds)).subscribe((households: ReadonlyArray<Household>) => {
			this.hhOptions = households.map(hh => {
				return { value: hh.uid, display: hh.name }
			})
		})
	}

	resetForm() {
		this.perk = this.newPerk()
		this.isDurabilityDisabled = false
	}

	newPerk(): FormGroup {
		return this.fb.group({
			title: new FormControl(null, Validators.required),
			description: new FormControl(null, Validators.required),
			cost: new FormControl(null, Validators.required),
			durability: new FormControl(null, Validators.required),
			hasUnlimited: new FormControl(null, Validators.required),
			household: new FormControl(null, Validators.required)
		})
	}

	createPerk() {
		let {
			title,
			description,
			cost,
			durability,
			hasUnlimited,
			household
		} = this.perk.controls

		title.markAsTouched(); description.markAsTouched(); cost.markAsTouched(); household.markAsTouched();
		if (
			title.invalid ||
			description.invalid ||
			cost.invalid ||
			household.invalid ||
			(durability.invalid && hasUnlimited.invalid)
		) {
			this.perk.markAllAsTouched()
			return
		}

		let newPerk = Perk.createNewPerk(this.perk.value)
		this.hhService.createNewPerk(newPerk)
		this.resetForm()
		UIkit.modal("#createPerk")?.hide()
	}

	handleCheckUnlimited() {
		var hasUnlimited = this.perk.get('hasUnlimited')?.value

		if (hasUnlimited) {
			this.perk.get('durability')?.reset()
		}

		this.isDurabilityDisabled = hasUnlimited
	}

	handleDurabilityInput() {
		this.perk.get('hasUnlimited')?.reset()
	}
}
