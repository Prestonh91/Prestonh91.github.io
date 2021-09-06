import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'gl-select',
	template: `
		<div>
			<select
				name="gl-select"
				class="gl-select uk-select"
				[class]="{ 'uk-form-danger': error === true, 'select-border-danger': error === true, 'select-border-primary': !error }"
				[formControl]="control"
			>
				<option [ngValue]="null">{{ selectPlaceholder }}</option>
				<option *ngFor="let o of options" [ngValue]="o.value">{{o.display}}</option>
			</select>
		</div>
	`,
  	styles: [`
  		.select-border-primary{ border: 1px solid #623bb3; }
		.select-border-danger{ border: 1px solid #f0506e; }
		:host { display: block; }
	`]
})
export class SelectComponent implements OnInit {
	@Input() options = new Array();
	@Input() error: boolean = false;
	@Input() selectPlaceholder = 'Select Item';
	@Input() control = new FormControl(null);
	public selection = null;

	constructor() { }

	ngOnInit(): void {
	}
}
