import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'create-quest',
  templateUrl: './create-quest.component.html',
  styleUrls: ['./create-quest.component.scss']
})
export class CreateQuestComponent implements OnInit {
	form = new FormGroup({
		name: new FormControl('', Validators.required),
		description: new FormControl('', Validators.required),
		objectives: new FormControl([''])
	})

  	constructor() { }

	ngOnInit(): void {

	}

	saveQuest() {
		console.log(this.form.get('name'))
	}

	resetForm() {
		this.form.reset()
	}
}
