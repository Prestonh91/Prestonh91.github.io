import { Component, Input, OnInit } from '@angular/core';
import { Perk } from 'src/app/classes/Perk';

@Component({
  selector: 'perk-card',
  templateUrl: './perk-card.component.html',
  styleUrls: ['./perk-card.component.scss'],
  styles: [`
	:host{ display: block; }
  `]
})
export class PerkCardComponent implements OnInit {
	@Input() perk = new Perk()

	constructor() { }

	ngOnInit(): void {
	}
}
