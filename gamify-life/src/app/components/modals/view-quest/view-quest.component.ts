import { HouseholdService } from 'src/app/services/household.service';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Household, Quest } from 'src/app/classes';
import { Observable } from 'rxjs';
import { DataSnapshot } from '@angular/fire/database/interfaces';

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

	constructor(private hhService: HouseholdService) { }

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
	}
}
