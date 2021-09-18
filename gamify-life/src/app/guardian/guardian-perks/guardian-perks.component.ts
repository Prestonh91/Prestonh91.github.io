import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Guardian } from 'src/app/classes';
import { Perk } from 'src/app/classes/Perk';
import { PerkService } from 'src/app/services/perk.service';
import { AppState } from 'src/store/app.state';
import { selectGuardian } from 'src/store/guardian/guardian.store';
import { trigger, animate, transition, state, style } from '@angular/animations'
declare var UIkit: any;

@Component({
	selector: 'app-guardian-perks',
	templateUrl: './guardian-perks.component.html',
	styleUrls: ['./guardian-perks.component.scss'],
	// animations: [
	// 	trigger('selectionEmpty', [
	// 		state('selection', style({
	// 			height: '25px',
	// 			backgroundColor: 'white'
	// 		})),
	// 		state('empty', style({
	// 			height: '0px',
	// 		})),
	// 		transition('empty => selection', [
	// 			animate('500ms ease-in')
	// 		]),
	// 		transition('selection => empty', [
	// 			animate('500ms ease-out')
	// 		])
	// 	]),
	// ]
})
export class GuardianPerksComponent implements OnInit, OnDestroy {
	perks: Array<Perk> = new Array()
	perkSelections: Array<Perk> = new Array()

	guardianSub = new Subscription()
	perkSub = new Subscription()


	constructor(
		private store: Store<AppState>,
		private perkService: PerkService,
	) { }

	ngOnInit(): void {
		this.guardianSub = this.store.pipe(select(selectGuardian)).subscribe((g: Readonly<Guardian>) => {
			this.perkSub = this.perkService.getGuardianPerks(g.households).subscribe((hhPerks: Array<Perk>) => {
				let currentHousehold = hhPerks[0].household
				let newPerkUids = hhPerks.map(x => x.uid)

				for (let perk of hhPerks) {
					let existingPerkUid = this.perks.findIndex(x => x.uid === perk.uid)
					if (existingPerkUid > -1) {
						this.perks.splice(existingPerkUid, 1, perk)
					} {
						this.perks.push(perk)
					}
				}

				this.perks = new Array(...this.perks.filter(p => {
					return p.household === currentHousehold ?
						newPerkUids.includes(p.uid) :
						true
				}))
			})
		})
	}

	ngOnDestroy(): void {
		this.perkSub.unsubscribe()
		this.guardianSub.unsubscribe()
	}

	addNewPerk() {
		UIkit.modal('#createPerk').show()
	}

	toggleSelectPerk(perk: Perk) {
		let isPerkSelected = this.perkSelections.findIndex(x => x.uid === perk.uid)
		if (isPerkSelected > -1) {
			this.perkSelections.splice(isPerkSelected, 1)
		} else {
			this.perkSelections.push(perk)
		}
	}

	isPerkSelected(perk: Perk): boolean {
		return !!this.perkSelections.find(x => x.uid === perk.uid)
	}
}
