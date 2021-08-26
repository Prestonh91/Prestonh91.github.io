import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { map, tap } from 'rxjs/operators';
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

	getQuests(guardianUid: string) {
		return this.fireDB.object(this.getQuestAuthorUrl(guardianUid)).valueChanges()
		.pipe(
			map((quests: any) => {
				return Object.values(quests).map((q: any) => {
					return new Quest(q)
				})
			})
		)
	}
}
