import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Guardian } from 'src/app/classes';
import { HouseholdService } from 'src/app/services/household.service';
import { AppState } from 'src/store/app.state';
import { selectGuardian } from 'src/store/guardian/guardian.store';

@Component({
  selector: 'app-guardian-profile',
  templateUrl: './guardian-profile.component.html',
  styleUrls: ['./guardian-profile.component.scss']
})
export class GuardianProfileComponent implements OnInit {
	public guardian: Guardian = new Guardian();
	public households$: Observable<any> = new Observable();

	public guardianSub: Subscription = new Subscription();

  	constructor(
		private store: Store<AppState>,
		private hhService: HouseholdService,
	) { }

	ngOnInit(): void {
		this.guardianSub = this.store.pipe(select(selectGuardian)).subscribe(x => {
			this.households$ = this.hhService.getHouseHolds(x.households)
			this.guardian = new Guardian(x)
		})
	}

	getObjectLength(object: any): Number {
		if (!object) return 0
		return Object.keys(object).length
	}

	handleLeaveHousehold(hhUid: string) {}
}
