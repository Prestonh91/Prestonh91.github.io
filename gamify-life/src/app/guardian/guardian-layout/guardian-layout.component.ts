import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Guardian } from 'src/app/classes/Guardian';
import { AppState } from 'src/store/app.state';
import { selectgaurdian } from 'src/store/guardian/guardian.store';

@Component({
  selector: 'app-guardian-layout',
  templateUrl: './guardian-layout.component.html',
  styleUrls: ['./guardian-layout.component.scss']
})
export class GuardianLayoutComponent implements OnInit {
	user$: Observable<Guardian> = this.store.pipe(select(selectgaurdian))


	constructor(public store: Store<AppState>) { }

	ngOnInit() {
	}
}
