import { Component, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Household } from 'src/app/classes';
import { AppState } from 'src/store/app.state';
import { getHouseholds } from 'src/store/household/household.store';

@Component({
  selector: 'create-perk',
  templateUrl: './create-perk.component.html',
  styleUrls: ['./create-perk.component.scss']
})
export class CreatePerkComponent implements OnInit {
	perk: FormGroup = this.newPerk()
	hhOptions: any[] = [];

	householdSubscription = new Subscription();

	constructor(
		private fb: FormBuilder,
		private store: Store<AppState>
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
}
