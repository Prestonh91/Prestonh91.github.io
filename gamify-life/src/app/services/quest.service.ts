import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { from } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Quest } from 'src/app/classes';
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

	constructor(
		private fireDB: AngularFireDatabase,
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

	createNewQuest(quest: Quest): Quest {
		// Get a new key for the quests
		var questDbRef = this.fireDB.database.ref(this.getHouseholdQuestContainer(quest.household!)).push()

		// Put the new key on the new quest
		quest.uid = questDbRef.key

		// Save the quest
		questDbRef.set(quest.prepareForSave())

		// Return the newly saved quest
		return quest
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

	deleteQuest(quest: Quest) {
		this.removeQuest(quest)
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
