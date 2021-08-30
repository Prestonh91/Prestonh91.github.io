import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { from } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Quest } from 'src/app/classes/Quest';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
	private questUrl: string = 'quests/'

	constructor(private fireDB: AngularFireDatabase) { }

	private getQuestAuthorUrl(authorUid: string) {
		return `${this.questUrl}/${authorUid}`
	}

	createNewQuest(quest: Quest) {
		var questDbRef = this.fireDB.database.ref(this.getQuestAuthorUrl(quest.author || '')).push()
		quest.uid = questDbRef.key
		return questDbRef.set(quest.prepareForSave())
	}

	getQuests(households: Object) {
		var questFetchers = []
		for (var h in Object.keys(households)) {
			questFetchers.push(this.fireDB.object(this.getQuestAuthorUrl(h)).valueChanges())
		}

		return from(questFetchers).pipe(
			mergeMap(x => x)
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
