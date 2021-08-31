import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Household } from 'src/app/classes';
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
export class GuardianSummaryComponent implements OnInit {
	quests$ = new Observable();
	households: Array<Household> = new Array<Household>();

  	constructor(private hhService: HouseholdService ,private questService: QuestService, private store: Store<AppState>) { }

	ngOnInit(): void {
		this.store.pipe(select(selectGuardian)).subscribe(x => {
			this.quests$ = this.questService.getQuests(x.households)
			this.hhService.getHouseHolds(x.households).subscribe((x: any) => {
				this.households = x
				this.store.dispatch(setHouseholds({households: x}))
			})
		})
	}

	getQuestsAsIterable(quests: any): any[] {
		return Object.values(quests)
	}

	getUnclaimedQuests(list: any) {
		const quests = Object.values(list)
		return quests.filter((x: any) => x.assignee === null)
	}
}
