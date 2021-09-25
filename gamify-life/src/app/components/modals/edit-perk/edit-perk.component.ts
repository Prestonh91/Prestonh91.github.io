import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { Household } from 'src/app/classes';
import { Perk } from 'src/app/classes/Perk';
import { AppState } from 'src/store/app.state';
import { getHouseholds } from 'src/store/household/household.store';

@Component({
  selector: 'edit-perk',
  templateUrl: './edit-perk.component.html',
  styleUrls: ['./edit-perk.component.scss']
})
export class EditPerkComponent implements OnInit, OnChanges {
	@Input() perk: Perk = new Perk();
	public mutablePerk: FormGroup = this.resetPerk()

	public householdOptions: any[] = []

	hhSub = new Subscription();

	constructor(
		private fb: FormBuilder,
		private store: Store<AppState>,
	) { }

	ngOnInit(): void {
		this.store.pipe(select(getHouseholds), filter((x: any) => x.length), first()).subscribe((hhs: ReadonlyArray<Household>) => {
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
		}
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
			durability: this.perk.durability,
			hasUnlimited: this.perk.hasUnlimited,
			household: this.perk.household,
			dateCreated: this.perk.dateCreated,
			dateUpdated: this.perk.dateUpdated,
			dateAccepted: this.perk.dateAccepted,
			uid: this.perk.uid,
		})
	}
}
