import { Component, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Guardian } from 'src/app/classes/Guardian';
import { HouseholdService } from 'src/app/services/household.service';
import { AppState } from 'src/store/app.state';
import { selectGuardian } from 'src/store/guardian/guardian.store';
import { setHouseholds } from 'src/store/household/household.store';

@Component({
  selector: 'app-guardian-layout',
  templateUrl: './guardian-layout.component.html',
  styleUrls: ['./guardian-layout.component.scss']
})
export class GuardianLayoutComponent implements OnInit, OnChanges {
	user$: Observable<Guardian> = this.store.pipe(select(selectGuardian))

	storeSS = new Subscription();
	hhSS = new Subscription();

	constructor(
		public store: Store<AppState>,
		private hhService: HouseholdService
	) { }

	ngOnInit() {
		this.storeSS = this.store.pipe(select(selectGuardian)).subscribe((guardian: Readonly<Guardian>) => {
			this.hhSS = this.hhService.getHouseHolds(guardian.households).subscribe(households => {
				this.store.dispatch(setHouseholds({ households: households}))
			})
		})
	}

	ngOnChanges() {
		this.storeSS.unsubscribe()
		this.hhSS.unsubscribe()
	}
}
