import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormControl, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { clearError, getError } from 'src/store/api/api.store';
import { AppState } from 'src/store/app.state';
import { Router } from '@angular/router';
import { setGuardian } from 'src/store/guardian/guardian.store';
import { Guardian } from 'src/app/classes';

@Component({
  selector: 'app-guardian-login',
  templateUrl: './guardian-login.component.html',
  styleUrls: ['./guardian-login.component.scss']
})
export class GuardianLoginComponent implements OnInit {
	// Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
	email = new FormControl('', [Validators.required, ]);
	password = new FormControl('', Validators.required);

	error$ = this.store.pipe(select(getError));

	constructor(public userAuthService: AuthService, public store: Store<AppState>, public router: Router) {}

	ngOnInit() {}

	async handleAuthenticate(e: Event) {
		e.preventDefault()
		if (this.email.valid && this.password.valid) {
			this.store.dispatch(clearError());

			let loginResponse = await this.userAuthService.loginGuardian(this.email.value, this.password.value)
			loginResponse.subscribe(user => {
				if (user) {
					this.store.dispatch(setGuardian({ guardian: new Guardian(user)}))
					this.router.navigate(['guardian', user.uid, 'household', 'setup'])
				}
			})
		}
	}
}
