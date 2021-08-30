import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Guardian } from 'src/app/classes/Guardian';
import { Quest } from 'src/app/classes/Quest';
import { QuestService } from 'src/app/services/quest.service';
import { AppState } from 'src/store/app.state';
import { selectGuardian } from 'src/store/guardian/guardian.store';
declare var UIkit: any;

@Component({
  selector: 'create-quest',
  templateUrl: './create-quest.component.html',
  styleUrls: ['./create-quest.component.scss']
})
export class CreateQuestComponent implements OnInit {
	guardian: Guardian = new Guardian();
	quest = this.newQuest()

  	constructor(private questService: QuestService, private fb: FormBuilder, private store: Store<AppState>) { }

	ngOnInit(): void {
		this.store.pipe(select(selectGuardian)).subscribe(g => {
			this.guardian = g
		})
	}

	newQuest() {
		return this.fb.group({
			title: ['', Validators.required],
			description: '',
			reward: [null, Validators.required],
			objectives: this.fb.array([ new FormControl('')])
		})
	}

	saveQuest() {
		var title = this.quest.get('title')
		var reward = this.quest.get('reward')

		if (!title?.valid || !reward?.valid) {
			title?.markAsTouched()
			reward?.markAsTouched()
			return
		}

		var newQuest = new Quest()
		newQuest.title = title?.value
		newQuest.reward = reward?.value
		newQuest.description = this.quest.get('description')?.value
		newQuest.objectives = this.quest.get('objectives')?.value?.filter((x: string) => x)
		newQuest.author = this.guardian.uid

		this.questService.createNewQuest(newQuest).then(x => {
			UIkit.modal('#createQuest')?.hide()
			this.resetForm()
		})
	}

	resetForm() {
		this.quest = this.newQuest()
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
