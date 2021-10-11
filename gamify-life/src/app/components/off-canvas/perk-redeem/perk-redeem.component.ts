import { Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { Ward } from 'src/app/classes';
import { Perk } from 'src/app/classes/Perk';

@Component({
  selector: 'perk-redeem',
  templateUrl: './perk-redeem.component.html',
  styleUrls: ['./perk-redeem.component.scss']
})
export class PerkRedeemComponent implements OnInit, OnChanges {
	@Input() perks: Array<Perk> = new Array();
	@Input() ward: Ward | null = null;
	@Output() cancel: EventEmitter<any> = new EventEmitter();

	public perksToRedeem:  Array<Perk> = new Array();
	public perkRedeemAmounts: any = {};

	constructor() { }

	ngOnInit(): void {
	}

	ngOnChanges(): void {
			if (this.perks.length) {
			this.perkRedeemAmounts = {}
			this.perksToRedeem = []
			for (let p of this.perks) {
				this.perkRedeemAmounts[p.uid] = 1
				this.perksToRedeem.push(new Perk(p))
			}
		}
	}

	addToPerkCount(perk: Perk) {
		let perkCount = this.perkRedeemAmounts[perk.uid]

		// Only add on if the perk has enough durability
		if ((perkCount + 1) <= perk.durability || perk.hasUnlimited) {
			this.perkRedeemAmounts[perk.uid] += 1
		}
	}

	removeFromPerkCount(perk: Perk) {
		this.perkRedeemAmounts[perk.uid] -= 1
	}

	removePerkFromRedeemList(perk: Perk) {
		var i = this.perksToRedeem.findIndex(x => x.uid === perk.uid)

		if (i > -1) {
			this.perksToRedeem.splice(i, 1)
		}
	}

	redeemPerks() {

	}

	cancelRedeem() {
		this.cancel.emit()
	}
}
