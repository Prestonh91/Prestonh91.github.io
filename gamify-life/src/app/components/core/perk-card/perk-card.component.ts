import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { Perk } from 'src/app/classes/Perk';

@Component({
	selector: 'perk-card',
	templateUrl: './perk-card.component.html',
	styleUrls: ['./perk-card.component.scss'],
	styles: [`
		:host{ display: block; }
	`],
	animations: [
		trigger('collapseExpand', [
			state('collapse', style({
				transform: 'rotate(0deg)',
			})),
			state('expand', style({
				transform: 'rotate(180deg)'
			})),
			transition('collapse <=> expand', [
				animate('200ms')
			])
		]),
		trigger('openClosed', [
			state('closed', style({
				height: '0px',
				padding: '0px',
				overflow: 'hidden',
			})),
			state('open', style({
				height: '200px',
				overflowY: 'scroll'
			})),
			transition('open => closed', [
				animate('200ms')
			]),
			transition('closed => open', [
				animate('200ms')
			])
		]),
	]
})
export class PerkCardComponent implements OnInit {
	@Input() perk = new Perk()
	@Input() isSelected = false;
	public isCollapsed: boolean = true;

	constructor() { }

	ngOnInit(): void {
	}

	toggleCollapseExpand(event: Event) {
		event.stopPropagation()
		this.isCollapsed = !this.isCollapsed
	}
}
