import { HouseholdService } from 'src/app/services/household.service';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Household, Quest, Ward } from 'src/app/classes';
import { Observable } from 'rxjs';
import { DataSnapshot } from '@angular/fire/database/interfaces';
import { WardService } from 'src/app/services/ward.service';

@Component({
  selector: 'view-quest',
  templateUrl: './view-quest.component.html',
  styleUrls: ['./view-quest.component.scss']
})
export class ViewQuestComponent implements OnInit, OnChanges {
	@Input() quest = new Quest()
	@Input() isUnassigned = false
	@Input() isInProgress = false
	@Input() isComplete = false
	household: Household = new Household()
	assignee$ = new Observable<Ward>();

	constructor(private hhService: HouseholdService, private wardService: WardService) { }

	ngOnInit(): void {}

	public get noBodyToDisplay(): boolean {
		return !this.quest.description && this.quest.objectives.length === 0
	}

	ngOnChanges() {
		if (this.quest.household !== null)
			this.hhService.getHousehouldPromise(this.quest.household).then((res: DataSnapshot) => {
				if (res.val())
					this.household = res.val()
			})

		if (this.quest.assignee) {
			this.assignee$ = this.wardService.getWardObservable(this.quest.assignee!)
		}
	}
}
