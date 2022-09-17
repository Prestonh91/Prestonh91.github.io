import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { from } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Quest } from 'src/app/classes';
import { TransactionService } from './transaction.service';
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

	private finalizeRootUpdates(updates: any) {
		this.fireDB.database.ref().update(updates)
	}

	constructor(
		private fireDB: AngularFireDatabase,
		private wardervice: WardService,
		private transactionService: TransactionService
	) { }

	private getHouseholdQuestContainer(hhUid: string) {
		return `${this.questUrl}${hhUid}`
	}

	private getExistingQuestUrl(quest: Quest | null = null, qUid: string = "", hhUid: string = "") {
		if (!quest && !qUid && !hhUid) {
			throw new Error("Quest Service: a quest or uids are needed.")
		}

		if (quest) {
			return `${this.questUrl}${quest.household}/${quest.uid}`
		} else {
			return `${this.questUrl}${hhUid}/${qUid}`
		}
	}

	private getQuestDateUpdatedUrl(quest: Quest) {
		return `${this.getExistingQuestUrl(quest)}/dateUpdated`
	}

	private getQuestDateCompletedUrl(quest: Quest) {
		return `${this.getExistingQuestUrl(quest)}/dateCompleted`
	}

	private removeQuest(quest: Quest) {
		this.fireDB.object(this.getExistingQuestUrl(quest)).remove()
	}

	voidSaveQuest(quest: Quest) {
		let updates: any = {}

		// Add quest to updates object
		this.updateAddQuest(quest, updates)

		// Finalize the updates
		this.finalizeRootUpdates(updates)
	}

	voidUpdateQuest(quest: Quest, updates: any) {
		updates[this.getQuestDateUpdatedUrl(quest)] = new Date()
		this.fireDB.object("/").update(updates)
	}

	createNewQuest(quest: Quest): Quest {
		// Get a new key for the quests
		var questDbRef = this.fireDB.database.ref(this.getHouseholdQuestContainer(quest.household!)).push()

		// Put the new key on the new quest
		quest.uid = questDbRef.key

		// Return the newly saved quest
		return quest
	}

	getQuests(households: Object) {
		var questFetchers = []

		// Get a list of household Observers
		for (var h of Object.keys(households)) {
			let url = this.getHouseholdQuestContainer(h)
			questFetchers.push(this.fireDB.object(url).snapshotChanges())
		}

		return from(questFetchers).pipe(
			// Get the inner observable
			mergeMap(x => x),
			// Get the payload of the snapshotChanges
			map(x => x.payload)
		)
	}

	async markQuestAsComplete(quest: Quest) {
		let updates: any = {}

		// Add ward updates to the updates object
		await this.wardervice.awardWardReward(quest, updates)

		// Create the transaction, add the transaction to the updates object
		let transaction = this.transactionService.createTransaction(quest.reward!, 1, quest.title!, quest.assignee!, true)
		this.transactionService.updateSaveTransaction(transaction, updates)

		// update the quest date completed and updated
		updates[this.getQuestDateCompletedUrl(quest)] = new Date()
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

	updateRemoveQuest(quest: Quest, updates: any) {
		updates[this.getExistingQuestUrl(quest)] = null
	}

	updateRemoveQuestWithUids(qUid: string, hhUid: string, updates: any) {
		updates[this.getExistingQuestUrl(null, qUid, hhUid)] = null
	}

	updateAddQuest(quest: Quest, updates: any) {
		updates[this.getExistingQuestUrl(quest)] = quest.prepareForSave()
	}
}
