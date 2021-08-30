import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HouseholdService } from 'src/app/services/household.service';

@Component({
  selector: 'app-guardian-household-setup',
  templateUrl: './guardian-household-setup.component.html',
  styleUrls: ['./guardian-household-setup.component.scss']
})
export class GuardianHouseholdSetupComponent implements OnInit {
	createNewHouseholdSelected: boolean = false;
	joinExistingHouseholdSelected: boolean = false;

	newHouseholdName = new FormControl(null, Validators.required);
	existingHouseholdUid = new FormControl(null, Validators.required)

	error: string = ''

	guardianUid: string = ''

	constructor(private hhService: HouseholdService, private route: ActivatedRoute, private router: Router) { }

	ngOnInit(): void {
		this.guardianUid = this.route.snapshot.paramMap.get('uid') || ''
	}

	async createNewHousehold() {
		if (!this.newHouseholdName.valid) {
			this.error = "Please enter a new name for the household."
			return
		}

		await this.hhService.createNewHousehold(this.newHouseholdName.value, this.guardianUid)
		this.router.navigate(['guardian'])
	}

	async joinExistingHousehold() {
		if (!this.existingHouseholdUid.valid) {
			this.error = 'Please enter the unique identifier for the existing household'
			return
		}

		await this.hhService.joinHousehold(this.existingHouseholdUid.value, this.guardianUid)
		this.router.navigate(['guardian'])
	}

	clearError() {
		this.error = ''
	}

	selectJoinExisting() {
		this.joinExistingHouseholdSelected = true
	}

	selectCreateNew() {
		this.createNewHouseholdSelected = true
	}

	clearChoice() {
		this.clearError()
		this.joinExistingHouseholdSelected = false
		this.createNewHouseholdSelected = false
		this.newHouseholdName.setValue(null)
		this.existingHouseholdUid.setValue(null)
	}
}
