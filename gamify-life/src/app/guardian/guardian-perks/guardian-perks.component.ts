import { Component, OnInit } from '@angular/core';
declare var UIkit: any;

@Component({
  selector: 'app-guardian-perks',
  templateUrl: './guardian-perks.component.html',
  styleUrls: ['./guardian-perks.component.scss']
})
export class GuardianPerksComponent implements OnInit {

	constructor() { }

	ngOnInit(): void {
	}

	addNewPerk() {
		UIkit.modal('#createPerk').show()
	}
}
