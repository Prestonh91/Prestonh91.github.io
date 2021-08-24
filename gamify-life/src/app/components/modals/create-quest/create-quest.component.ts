import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'create-quest',
  templateUrl: './create-quest.component.html',
  styleUrls: ['./create-quest.component.scss']
})
export class CreateQuestComponent implements OnInit {
	quest = this.fb.group({
		name: ['', Validators.required],
		description: '',
		reward: null,
		objectives: this.fb.array([ new FormControl('first'), new FormControl('second')])
	})

  	constructor(private fb: FormBuilder) { }

	ngOnInit(): void {}

	saveQuest() {}

	resetForm() {
		this.quest.reset()
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
