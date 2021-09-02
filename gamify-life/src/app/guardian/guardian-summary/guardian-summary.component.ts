import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Household, Quest } from 'src/app/classes';
import { HouseholdService } from 'src/app/services/household.service';
import { QuestService } from 'src/app/services/quest.service';
import { AppState } from 'src/store/app.state';
import { selectGuardian } from 'src/store/guardian/guardian.store';
import { setHouseholds } from 'src/store/household/household.store';

@Component({
  selector: 'app-guardian-summary',
  templateUrl: './guardian-summary.component.html',
  styleUrls: ['./guardian-summary.component.scss']
})
export class GuardianSummaryComponent implements OnInit, OnDestroy {
	quests = Array<Quest>();
	households: Array<Household> = new Array<Household>();

	storeSubscription = new Subscription();
	questSubscription = new Subscription();
	householdSubscription = new Subscription();

  	constructor(private hhService: HouseholdService ,private questService: QuestService, private store: Store<AppState>) { }

	ngOnInit(): void {
		this.storeSubscription = this.store.pipe(select(selectGuardian)).subscribe(x => {
			this.questSubscription = this.questService.getQuests(x.households).subscribe(householdQuests => {
				var questUids = this.quests.map(q => q.uid)
				this.quests = householdQuests
				// for (let q of householdQuests) {
				// 	if (!questUids.includes(q.uid)) {
				// 		this.quests.push(q)
				// 	}
				// }
			})
			this.householdSubscription = this.hhService.getHouseHolds(x.households).subscribe((x: any) => {
				this.households = x
				this.store.dispatch(setHouseholds({households: x}))
			})
		})
	}

	ngOnDestroy() {
		this.storeSubscription.unsubscribe()
		this.questSubscription.unsubscribe()
		this.householdSubscription.unsubscribe()
	}

	getUnclaimedQuests(list: any) {
		const quests = Object.values(list)
		return quests.filter((x: any) => x.assignee === null)
	}
}
