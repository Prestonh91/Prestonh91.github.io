import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { from } from 'rxjs';
import { filter, map, mergeMap, reduce, take, tap, toArray } from 'rxjs/operators';
import { Quest } from 'src/app/classes/Quest';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
	private questUrl: string = 'quests/'

	constructor(private fireDB: AngularFireDatabase) { }

	private getQuestHousholdUrl(hhUid: string) {
		return `${this.questUrl}/${hhUid}`
	}

	createNewQuest(quest: Quest) {
		var questDbRef = this.fireDB.database.ref(this.getQuestHousholdUrl(quest.household || '')).push()
		quest.uid = questDbRef.key
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
