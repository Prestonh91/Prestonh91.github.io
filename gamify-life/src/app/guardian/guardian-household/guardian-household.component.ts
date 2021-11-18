import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Household } from 'src/app/classes';
import { HouseholdService } from 'src/app/services/household.service';

@Component({
  selector: 'app-guardian-household',
  templateUrl: './guardian-household.component.html',
  styleUrls: ['./guardian-household.component.scss']
})
export class GuardianHouseholdComponent implements OnInit {
	hh$: Observable<Household> = new Observable();


  	constructor(
		private route: ActivatedRoute,
		private hhService: HouseholdService
	) { }

	ngOnInit(): void {
		this.hh$ = this.hhService.getHouseholdObserver(this.route.snapshot.params.hhUid)
	}

}
