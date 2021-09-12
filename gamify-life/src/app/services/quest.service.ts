import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngrx/store';
import { from } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Quest, Household } from 'src/app/classes';
import { AppState } from 'src/store/app.state';
import { setHousehold } from 'src/store/household/household.store';
import { HouseholdService } from './household.service';
import { WardService } from './ward.service';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
	private questUrl: string = 'quests/'

	private updateQuest(quest: Quest, updates: any) {
		updates["/dateUpdated"] = new Date().toISOString()
		this.fireDB.object(this.getExistingQuestUrl(quest)).update(updates)
	}

	constructor(private fireDB: AngularFireDatabase,
		private store: Store<AppState>,
		private hhService: HouseholdService,
		private wardervice: WardService) { }

	private getHouseholdQuestContainer(hhUid: string) {
		return `${this.questUrl}${hhUid}`
	}

	private getExistingQuestUrl(quest: Quest) {
		return `${this.questUrl}${quest.household}/${quest.uid}`
	}

	private removeQuest(quest: Quest) {
		this.fireDB.object(this.getExistingQuestUrl(quest)).remove()
	}

	voidSaveQuest(quest: Quest) {
		this.fireDB.object(this.getExistingQuestUrl(quest)).set(quest.prepareForSave())
	}

	voidUpdateQuest(quest: Quest, updates: any) {
		updates["dateUpdated"] = new Date().toISOString()
		this.fireDB.object(this.getExistingQuestUrl(quest)).update(updates)
	}

	createNewQuest(quest: Quest) {
		// Get a new key for the quests
		var questDbRef = this.fireDB.database.ref(this.getHouseholdQuestContainer(quest.household!)).push()

		// Put the new key on the new quest
		quest.uid = questDbRef.key

		// Fetch the household to add the new quest to it, save the household, update the store
		this.hhService.getHousehouldPromise(quest.household!).then(hh => {
			if (hh.val()) {
				let h = new Household(hh.val())
				h.addQuest(quest.uid!)
				this.hhService.voidSaveHousehold(h)
				this.store.dispatch(setHousehold({ household: h }))
			}
		})

		// Save the quest
		return questDbRef.set(quest.prepareForSave())
	}

	getQuests(households: Object) {
		var questFetchers = []

		// Get a list of household Observers
		for (var h of Object.keys(households)) {
			let url = this.getHouseholdQuestContainer(h)
			questFetchers.push(this.fireDB.object(url).valueChanges())
		}

		return from(questFetchers).pipe(
			// Get the inner observable
			mergeMap(x => x),
			// Filter out the empty observables
			filter((x: any) => x),
			// Map over the objects return them as a list
			map(householdQuests => {
				var quests: Quest[] = []

				for (let q of Object.keys(householdQuests)) {
					quests.push(new Quest(householdQuests[q]))
				}

				return quests
			})
		)
	}

	markQuestAsComplete(quest: Quest) {
		this.wardervice.awardWardReward(quest)

		var updates: any = {}
		updates["dateCompleted"] = new Date().toISOString()
		this.voidUpdateQuest(quest, updates)
	}

	deleteQuest(quest: Quest, household: Household) {
		this.removeQuest(quest)
		this.hhService.removeQuestFromHousehold(quest, household)
	}

	removeQuestCompletionDate(quest: Quest) {
		var updates: any = {}

		updates["/dateCompleted"] = null
		this.updateQuest(quest, updates)
	}

	reuseQuest(quest: Quest) {
		var updates: any = {}

		updates["/dateCompleted"] = null
		updates["/assignee"] = null
		this.updateQuest(quest, updates)
	}
}
