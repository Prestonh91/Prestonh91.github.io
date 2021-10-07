import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Household, Ward } from 'src/app/classes';
import { Perk } from 'src/app/classes/Perk';

@Component({
  selector: 'redeem-perks',
  templateUrl: './redeem-perks.component.html',
  styleUrls: ['./redeem-perks.component.scss']
})
export class RedeemPerksComponent implements OnInit, OnChanges {
	@Input() perks: Array<Perk> = new Array();
	@Input() households: Array<Household> = new Array();

	availableWards: Array<Ward> = new Array();

	constructor() { }

	ngOnInit(): void {
	}

	ngOnChanges(): void {
		if (this.perks.length) {
			this.findHouseholdWardUnion()
		}
	}

	findHouseholdWardUnion() {
		for (var i in this.perks) {

		}
	}
}
