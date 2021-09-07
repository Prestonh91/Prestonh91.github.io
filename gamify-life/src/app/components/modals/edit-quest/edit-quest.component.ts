import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Quest } from 'src/app/classes';
declare var UIkit: any;

@Component({
  selector: 'edit-quest',
  templateUrl: './edit-quest.component.html',
  styleUrls: ['./edit-quest.component.scss']
})
export class EditQuestComponent implements OnInit, OnChanges {
	@Input() quest = new Quest()
	@Input() isUnassigned = false
	@Input() isInProgress = false
	@Input() isComplete = false
	public mutableQuest = this.newQuest()



	constructor(private fb: FormBuilder) { }

	ngOnInit(): void {}

	ngOnChanges(): void {
		if (this.quest.uid)
			this.setQuest()
	}

	setQuest() {
		this.resetQuest()
		this.mutableQuest.get('title')?.setValue(this.quest.title)
		this.mutableQuest.get('reward')?.setValue(this.quest.reward)
		this.mutableQuest.get('description')?.setValue(this.quest.description)
		this.mutableQuest.get('assignee')?.setValue(this.quest.assignee)
		this.mutableQuest.get('household')?.setValue(this.quest.household)
	}

	newQuest() {
		return this.fb.group({
			title: ['', Validators.required],
			description: null,
			reward: ['', Validators.required],
			objectives: this.fb.array([ new FormControl('')]),
			assignee: null,
			household: null,
		})
	}

	resetQuest() {
		this.mutableQuest = this.newQuest()
	}

	closeEdit() {
		this.resetQuest()
		var modal = UIkit.modal('#editQuest').hide()
	}
}
