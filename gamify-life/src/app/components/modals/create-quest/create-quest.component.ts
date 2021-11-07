import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { from, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Guardian, Household, Quest } from 'src/app/classes';
import { HouseholdService } from 'src/app/services/household.service';
import { QuestService } from 'src/app/services/quest.service';
import { WardService } from 'src/app/services/ward.service';
import { AppState } from 'src/store/app.state';
import { selectGuardian } from 'src/store/guardian/guardian.store';
import { getHousehold, getHouseholds } from 'src/store/household/household.store';
declare var UIkit: any;

@Component({
  selector: 'create-quest',
  templateUrl: './create-quest.component.html',
  styleUrls: ['./create-quest.component.scss']
})
export class CreateQuestComponent implements OnInit, OnDestroy {
	guardian: Guardian = new Guardian();
	quest = this.newQuest()
	questHousehold = new FormControl(null, Validators.required)
	assignee = new FormControl(null)
	householdOptions: any[] = []
	assigneeOptions: any[] = []

	householdSubscription = new Subscription()
	questHouseholdSubscription = new Subscription()
	assigneeSubscription = new Subscription()
	guardianSubscription = new Subscription()

  	constructor(
		private questService: QuestService,
		private wardService: WardService,
		private hhService: HouseholdService,
		private fb: FormBuilder,
		private store: Store<AppState>
	) {}

	ngOnInit(): void {
		this.guardianSubscription = this.store.pipe(select(selectGuardian)).subscribe(g => {
			this.guardian = g
		})
		this.householdSubscription = this.store.pipe(select(getHouseholds)).subscribe((x: ReadonlyArray<Household>) => {
			this.householdOptions = x.map(y => {
				return { value: y.uid, display: y.name }
			})
		})
		this.questHouseholdSubscription = this.questHousehold.valueChanges.subscribe((value: any) => {
			this.assignee.reset()
			this.assigneeSubscription = this.store.pipe(
				select(getHousehold(value)),
				mergeMap((x: Household | undefined) => {
					if (x) {
						return this.wardService.getListOfWardsObservable(Object.keys(x.wards))
					}

					return from([])
				})
			).subscribe(x => {
				this.assigneeOptions = x.map((y: any) => {
					return { value: y.uid, display: y.displayName}
				})
			})
		})
	}

	ngOnDestroy(): void {
		this.householdSubscription.unsubscribe()
		this.questHouseholdSubscription.unsubscribe()
		this.assigneeSubscription.unsubscribe()
		this.guardianSubscription.unsubscribe()
	}

	newQuest() {
		return this.fb.group({
			title: ['', Validators.required],
			description: '',
			reward: [null, Validators.required],
			objectives: this.fb.array([ new FormControl('')]),
		})
	}

	saveQuest() {
		var title = this.quest.get('title')
		var reward = this.quest.get('reward')

		if (!title?.valid || !reward?.valid || !this.questHousehold.valid) {
			title?.markAsTouched()
			reward?.markAsTouched()
			this.questHousehold.markAsTouched()
			return
		}

		var newQuest = new Quest()
		newQuest.title = title?.value
		newQuest.reward = reward?.value
		newQuest.description = this.quest.get('description')?.value
		newQuest.household = this.questHousehold.value
		newQuest.objectives = this.quest.get('objectives')?.value?.filter((x: string) => x)
		newQuest.author = this.guardian.uid
		newQuest.assignee = this.assignee.value
		newQuest.dateCreated = new Date()

		this.hhService.createNewQuest(newQuest)
		UIkit.modal('#createQuest')?.hide()
		this.resetForm()
	}

	resetForm() {
		this.quest = this.newQuest()
		this.questHousehold.reset()
	}

	getObjectives(): FormArray {
		return this.quest.get('objectives') as FormArray
	}

	getObjectiveControls(): AbstractControl[] {
		return (this.quest.get('objectives') as FormArray).controls
	}

	getObjControl(index: number): FormControl {
		return (this.getObjectiveControls()[index] as FormControl)
	}

	removeObjective(index: number) {
		this.getObjectives().removeAt(index)
	}

	addObjective() {
		this.getObjectives().push(new FormControl(''))
	}
}
