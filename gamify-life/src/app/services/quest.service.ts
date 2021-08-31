import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { from } from 'rxjs';
import { map, mergeMap, reduce, take, tap, toArray } from 'rxjs/operators';
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
			take(Object.keys(households).length),
			reduce((acc: any, val: any) => {
				for (let x of Object.keys(val)) {
					let q = val[x]
					acc.push(new Quest(q))
				}
				return acc
			}, []),
			// map((val: any) => {
			// 	debugger
			// 	return val.map((x: any) => {
			// 		debugger
			// 		return new Quest(x)
			// 	})
			// }),
		)

		// return this.fireDB.object(this.getQuestAuthorUrl(hhUid)).valueChanges()
		// .pipe(
		// 	map((quests: any) => {
		// 		return Object.values(quests).map((q: any) => {
		// 			return new Quest(q)
		// 		})
		// 	})
		// )
	}
}
