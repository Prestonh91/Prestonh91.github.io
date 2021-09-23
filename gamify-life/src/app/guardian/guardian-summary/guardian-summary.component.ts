import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Household, Quest } from 'src/app/classes';
import { HouseholdService } from 'src/app/services/household.service';
import { QuestService } from 'src/app/services/quest.service';
import { AppState } from 'src/store/app.state';
import { selectGuardian } from 'src/store/guardian/guardian.store';
import { getHouseholds } from 'src/store/household/household.store';
declare var UIkit: any;

@Component({
  selector: 'app-guardian-summary',
  templateUrl: './guardian-summary.component.html',
  styleUrls: ['./guardian-summary.component.scss']
})
export class GuardianSummaryComponent implements OnInit, OnDestroy {
	quests = Array<Quest>();
	households: Array<Household> = new Array()

	questToView: Quest = new Quest();
	questToEdit: Quest = new Quest();
	questToDelete: Quest = new Quest();

	storeSubscription = new Subscription();
	questSubscription = new Subscription();
	hhSub = new Subscription();

  	constructor(
		private questService: QuestService,
		private hhService: HouseholdService,
		private store: Store<AppState>) { }

	ngOnInit(): void {
		this.storeSubscription = this.store.pipe(select(selectGuardian)).subscribe(x => {
			this.questSubscription = this.questService.getQuests(x.households).subscribe(hhQuestsSnapshot => {
				var householdQuests: Array<Quest> = []
				let data: any = hhQuestsSnapshot.val()

				if (data) {
					for (let q of Object.keys(data)) {
						householdQuests.push(new Quest(data[q]))
					}
				}

				let currentHousehold = hhQuestsSnapshot.key
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
		})

		this.hhSub = this.store.pipe(select(getHouseholds)).subscribe((hhs: ReadonlyArray<Household>) => {
			this.households = []
			hhs.forEach((hh: Household) => {
				this.households.push(new Household(hh))
			})
		})

		UIkit.util.on('#viewQuest', 'hide', () => { this.questToView = new Quest() })
		UIkit.util.on('#editQuest', 'hide', () => { this.questToEdit = new Quest() })
	}

	ngOnDestroy() {
		this.storeSubscription.unsubscribe()
		this.questSubscription.unsubscribe()
		this.hhSub.unsubscribe()
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
		UIkit.modal.confirm("Are you sure? Deleting this quest is irreversible.").then(() => {
			let questHH = this.households.find(x => x.uid === quest.household)
			if (questHH) {
				this.hhService.removeQuestFromHousehold(quest, questHH)
			}
		}, () => {})
	}

	reuseQuest(quest: Quest) {
		this.questService.reuseQuest(quest)
	}

	reassignQuest(quest: Quest) {
		this.questService.removeQuestCompletionDate(quest)
	}
}
