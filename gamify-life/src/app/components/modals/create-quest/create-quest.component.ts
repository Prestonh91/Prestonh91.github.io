import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

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
		objectives: this.fb.array([''])
	})

  	constructor(private fb: FormBuilder) { }

	ngOnInit(): void {
		console.log(this.quest.get('name'))
	}

	saveQuest() {}

	resetForm() {
		this.quest.reset()
	}

	setObjective(event: any, index: number) {
		console.log(this.quest.get('objectives'))
		// let value: string = event.target.value
		// let objectives = this.form.get('objectives')
		// let objValues = this.form.get('objectives')?.value
		// if (!value && objValues.length !== 1 && objValues.length > (index + 1) && !objValues[objValues.length]) {
		// 	debugger
		// 	objValues.splice(index, 1)
		// 	debugger
		// 	objectives?.setValue(objValues)
		// } else if (value && (index + 1) === objValues.length) {
		// 	objValues.push('')
		// 	objectives?.setValue(objValues)
		// } else {
		// 	debugger
		// 	objValues[index] = value
		// 	objectives?.setValue(objValues)
		// }
	}
}
