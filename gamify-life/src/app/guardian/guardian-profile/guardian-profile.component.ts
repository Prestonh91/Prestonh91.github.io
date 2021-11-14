import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Guardian, Household } from 'src/app/classes';
import { HouseholdService } from 'src/app/services/household.service';
import { AppState } from 'src/store/app.state';
import { selectGuardian } from 'src/store/guardian/guardian.store';
import { getHouseholds } from 'src/store/household/household.store';

@Component({
  selector: 'app-guardian-profile',
  templateUrl: './guardian-profile.component.html',
  styleUrls: ['./guardian-profile.component.scss']
})
export class GuardianProfileComponent implements OnInit, OnDestroy {
	public guardian: Guardian = new Guardian();
	public households: Household[] = new Array();

	public guardianSub: Subscription = new Subscription();
	public hhSub: Subscription = new Subscription();

	public data: any = {
		isCreateHHSelected: true,
		isJoinHHSelected: false,
		householdInput: new FormControl(),
	}

	public get hhPlaceholder() {
		return this.data.isCreateHHSelected ? 'Enter Household Name' : this.data.isJoinHHSelected ? 'Enter Household Id' : ''
	}

  	constructor(
		private store: Store<AppState>,
		private hhService: HouseholdService,
	) { }

	ngOnInit(): void {
		this.hhSub = this.store.pipe(select(getHouseholds)).subscribe(x => {
			this.households = x.map(y => new Household(y))
		})
		this.guardianSub = this.store.pipe(select(selectGuardian)).subscribe(x => {
			this.guardian = new Guardian(x)
		})
	}

	ngOnDestroy(): void {
		this.guardianSub.unsubscribe()
		this.hhSub.unsubscribe()
	}

	getObjectLength(object: any): Number {
		if (!object) return 0
		return Object.keys(object).length
	}

	handleLeaveHousehold(hhUid: string) {
		let hhToLeave = this.households.find(x => x.uid === hhUid)
		this.hhService.guardianLeaveHousehold(this.guardian, hhToLeave!)
	}

	handleDeleteHousehold(hhUid: string) {
		const hhToDelete = this.households.find(x => x.uid === hhUid)
		this.hhService.deleteHousehold(hhToDelete!, this.guardian)
	}

	getNumberOfGuardians(hh: Household): Number {
		return Object.keys(hh.guardians).length
	}

	handleSelectCreateHH() {
		this.data.isCreateHHSelected = true
		this.data.isJoinHHSelected = false
		this.data.householdInput.reset()
	}

	handleSelectJoinHH() {
		this.data.isCreateHHSelected = false
		this.data.isJoinHHSelected = true
		this.data.householdInput.reset()
	}

	handeSubmitHousehold() {
		if (this.data.householdInput.value) {
			if (this.data.isCreateHHSelected) {
				this.hhService.createNewHousehold(this.data.householdInput.value, this.guardian.uid!)
			} else if (this.data.isJoinHHSelected) {
				this.hhService.joinHousehold(this.data.householdInput.value, this.guardian.uid!)
			}
		}

		this.data.householdInput.reset()
	}
}
