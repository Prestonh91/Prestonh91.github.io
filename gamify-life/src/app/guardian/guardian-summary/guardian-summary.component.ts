import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Quest } from 'src/app/classes/Quest';
import { QuestService } from 'src/app/services/quest/quest.service';
import { AppState } from 'src/store/app.state';
import { selectGuardian } from 'src/store/guardian/guardian.store';

@Component({
  selector: 'app-guardian-summary',
  templateUrl: './guardian-summary.component.html',
  styleUrls: ['./guardian-summary.component.scss']
})
export class GuardianSummaryComponent implements OnInit {
	quests$ = new Observable();

  	constructor(private questService: QuestService, private store: Store<AppState>) { }

	ngOnInit(): void {
		this.store.pipe(select(selectGuardian)).subscribe(x => {
			this.quests$ = this.questService.getQuests(x.uid || '')
		})
	}

	getQuestsAsIterable(quests: any): any[] {
		return Object.values(quests)
	}

	getUnclaimedQuests(list: any) {
		const quests = Object.values(list)
		return quests.filter((x: any) => x.assignee === null)
	}
}
