import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { select, Store } from '@ngrx/store';
import { from } from 'rxjs';
import { filter, map, mergeMap, reduce, take, tap, toArray } from 'rxjs/operators';
import { Quest, Household } from 'src/app/classes';
import { AppState } from 'src/store/app.state';
import { getHousehold, getHouseholds, setHousehold } from 'src/store/household/household.store';
import { HouseholdService } from './household.service';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
	private questUrl: string = 'quests/'

	constructor(private fireDB: AngularFireDatabase, private store: Store<AppState>, private hhService: HouseholdService) { }

	private getQuestHousholdUrl(hhUid: string) {
		return `${this.questUrl}/${hhUid}`
	}

	createNewQuest(quest: Quest) {
		// Get a new key for the quests
		var questDbRef = this.fireDB.database.ref(this.getQuestHousholdUrl(quest.household!)).push()

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
		for (var h of Object.keys(households)) {
			let url = this.getQuestHousholdUrl(h)
			questFetchers.push(this.fireDB.object(url).valueChanges())
		}

		return from(questFetchers).pipe(
			mergeMap(x => x),
			filter((x: any) => x),
			map(householdQuests => {
				var quests: Quest[] = []

				for (let q of Object.keys(householdQuests)) {
					quests.push(new Quest(householdQuests[q]))
				}

				return quests
			})
		)

		// return from(questFetchers).pipe(
		// 	mergeMap(x => x),
		// 	take(questFetchers.length),
		// 	toArray(),
		// 	map(x => {
		// 		var quests = []

		// 		var questList: any
		// 		for (questList of x.filter(x => x)) {
		// 			for (let q of Object.keys(questList)) {
		// 				quests.push(new Quest(questList[q]))
		// 			}
		// 		}

		// 		return quests
		// 	}),
		// 	tap(x => console.warn(x))
		// )
	}
}
