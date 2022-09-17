import { Component, Input, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
	selector: 'gl-select-form',
	template: `
		<select
			name="gl-select"
			class="uk-select"
			[class]="{ 'gl-form-danger': error === true }"
			(change)="changeSelection($event)"
			[(ngModel)]="selection"
		>
			<option [ngValue]="null">{{ selectPlaceholder }}</option>
			<option *ngFor="let o of options" [ngValue]="o.value">{{o.display}}</option>
		</select>
	`,
  	styles: [`
		:host { display: block; }
		.gl-form-danger, .gl-form-danger:focus {
			border: 1px solid #f0506e;
			color: #f0506e;
		}
	`],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			multi: true,
			useExisting: SelectComponentForm
		}
	]
})
export class SelectComponentForm implements ControlValueAccessor {
	@Input() options = new Array();
	@Input() error: boolean = false;
	@Input() selectPlaceholder = 'Select Item';
	@Input() primary = true;
	@Input() secondary = false;
	@Input() tertiary = false;
	public selection = null;

	onChange = (value: any) => {}
	onTouched = () => {}
	touched = false
	disabled = false

	changeSelection(event: any) {
		if (!this.disabled) {
			this.onChange(this.selection)
			this.markAsTouched()
		}
	}

	markAsTouched() {
		this.onTouched()
		this.touched = true
	}

	registerOnChange(onChange: any) {
		this.onChange = onChange
	}

	registerOnTouched(onTouched: any) {
		this.onTouched = onTouched
	}

	setDisabledState(disabled: boolean) {
		this.disabled = disabled
	}

	writeValue(selection: any) {
		this.selection = selection
	}
}
