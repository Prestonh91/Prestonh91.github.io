import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Household, Quest } from 'src/app/classes';
import { HouseholdService } from 'src/app/services/household.service';
import { QuestService } from 'src/app/services/quest.service';
import { AppState } from 'src/store/app.state';
import { selectGuardian } from 'src/store/guardian/guardian.store';
import { setHouseholds } from 'src/store/household/household.store';
declare var UIkit: any;

@Component({
  selector: 'app-guardian-summary',
  templateUrl: './guardian-summary.component.html',
  styleUrls: ['./guardian-summary.component.scss']
})
export class GuardianSummaryComponent implements OnInit, OnDestroy {
	quests = Array<Quest>();
	households: Array<Household> = new Array<Household>();

	questToView: Quest = new Quest();
	questToEdit: Quest = new Quest();
	questToDelete: Quest = new Quest();

	storeSubscription = new Subscription();
	questSubscription = new Subscription();
	householdSubscription = new Subscription();

  	constructor(
		private hhService: HouseholdService,
		private questService: QuestService,
		private store: Store<AppState>) { }

	ngOnInit(): void {
		this.storeSubscription = this.store.pipe(select(selectGuardian)).subscribe(x => {
			this.questSubscription = this.questService.getQuests(x.households).subscribe(householdQuests => {
				let currentHousehold = householdQuests[0].household
				let newQuestUids = householdQuests.map(x => x.uid)

				for (let q of householdQuests) {
					let qIndex = this.quests.findIndex(x => x.uid === q.uid)
					if (qIndex > -1) {
						this.quests.splice(qIndex, 1, q)
					} else {
						this.quests.push(q)
					}
				}

				// This is to remove quests that may have been deleted
				this.quests = new Array(...this.quests.filter(x => {
					// Skip the quest if it isn't from this households batch
					// If it is in this households batch check it came down from the db
					return x.household === currentHousehold ?
						newQuestUids.includes(x.uid) :
						true

				}))
			})
			this.householdSubscription = this.hhService.getHouseHolds(x.households).subscribe((x: any) => {
				this.households = x
				this.store.dispatch(setHouseholds({households: x}))
			})
		})

		UIkit.util.on('#viewQuest', 'hide', () => { this.questToView = new Quest() })
		UIkit.util.on('#editQuest', 'hide', () => { this.questToEdit = new Quest() })
	}

	ngOnDestroy() {
		this.storeSubscription.unsubscribe()
		this.questSubscription.unsubscribe()
		this.householdSubscription.unsubscribe()
	}

	getUnclaimedQuests(list: Array<Quest>) {
		return list.filter((x: any) => x.assignee === null)
	}

	getClaimedQuests(list: Array<Quest>) {
		return list.filter(x => x.assignee !== null && x.dateCompleted === null)
	}

	getCompletedQuests(list: Array<Quest>) {
		return list.filter(x => x.assignee !== null && x.dateCompleted !== null)
	}

	viewQuest(quest: Quest) {
		this.questToView = quest
		UIkit.modal('#viewQuest').show()
	}

	editQuest(quest: Quest) {
		this.questToEdit = quest
		UIkit.modal('#editQuest').show()
	}

	deleteQuest(quest: Quest) {
		console.warn('deleting quest', quest)

	}
}
