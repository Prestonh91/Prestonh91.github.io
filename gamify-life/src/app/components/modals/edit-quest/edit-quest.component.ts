import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Household, Quest } from 'src/app/classes';
import { WardService } from 'src/app/services/ward.service';
import { AppState } from 'src/store/app.state';
import { getHouseholds } from 'src/store/household/household.store';
declare var UIkit: any;

@Component({
  selector: 'edit-quest',
  templateUrl: './edit-quest.component.html',
  styleUrls: ['./edit-quest.component.scss']
})
export class EditQuestComponent implements OnInit, OnChanges, OnDestroy {
	@Input() quest = new Quest()
	@Input() isUnassigned = false
	@Input() isInProgress = false
	@Input() isComplete = false
	public mutableQuest = this.newQuest()

	public households: ReadonlyArray<Household> = new Array()
	public hhOptions: any[] = []
	public assigneeOptions: any[] = []

	private householdSub = new Subscription()
	private householdChangesSub = new Subscription()
	private assigneeSub = new Subscription()

	public get objectives(): FormArray {
		return this.mutableQuest.get('objectives') as FormArray
	}

	constructor(private fb: FormBuilder,
		private store: Store<AppState>,
		private wardService: WardService
	) { }

	ngOnInit(): void {
		this.householdSub = this.store.pipe(select(getHouseholds)).subscribe((hhs: ReadonlyArray<Household>) => {
			this.households = hhs
			this.hhOptions = hhs.map(hh => {
				return { value: hh.uid, display: hh.name }
			})
		})

		var hhControl = this.mutableQuest.get('household')
		if (hhControl) {
			this.householdChangesSub = hhControl.valueChanges.subscribe((x: any) => {
				this.mutableQuest.get('assignee')?.reset()
				let household = this.households.find(y => y.uid === x)
				if (household) {
					this.assigneeSub = this.wardService.getListOfWardsObservable(Object.keys(household.wards)).subscribe(y => {
						this.assigneeOptions = y.map(x => {
							return { value: x.uid, display: x.displayName}
						})
					})
				}
			})
		}
	}

	ngOnDestroy(): void {
		this.householdSub.unsubscribe()
		this.householdChangesSub.unsubscribe()
		this.assigneeSub.unsubscribe()
	}

	ngOnChanges(): void {
		if (this.quest.uid) {
			this.setQuest()
			this.initAssigneeOptions(this.households)
		}
	}

	async initAssigneeOptions(households: ReadonlyArray<Household>) {
		if (this.quest.household) {
			let currentHousehold = households.find(x => x.uid === this.quest.household)
			let wards = await this.wardService.getListOfWardsValue(Object.keys(currentHousehold?.wards!))
			this.assigneeOptions = wards.map(x => {
				return { value: x.uid, display: x.displayName }
			})
		}
	}

	setQuest() {
		var objControls = []
		for (let obj of this.quest.objectives) {
			objControls.push(new FormControl(obj))
		}

		if (objControls.length === 0) {
			objControls.push(new FormControl(''))
		}

		this.mutableQuest = this.fb.group({
			title: [this.quest.title, Validators.required],
			reward: [this.quest.reward, Validators.required ],
			description: this.quest.description,
			assignee: this.quest.assignee,
			household: [this.quest.household, Validators.required],
			objectives: this.fb.array(objControls)
		})
	}

	newQuest() {
		return this.fb.group({
			title: ['', Validators.required],
			reward: ['', Validators.required],
			description: null,
			assignee: null,
			household: [null, Validators.required],
			objectives: this.fb.array([ new FormControl('')]),
		})
	}

	resetQuest() {
		this.mutableQuest = this.newQuest()
	}

	closeEdit() {
		this.resetQuest()
		var modal = UIkit.modal('#editQuest').hide()
	}

	addObjective() {}
	removeObjective(index: any) { console.warn(index)}
}
