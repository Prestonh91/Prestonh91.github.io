import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormControl, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { clearError, getError } from 'src/store/api/api.store';
import { AppState } from 'src/store/app.state';
import { Router } from '@angular/router';
import { Guardian } from 'src/app/classes';

@Component({
  selector: 'app-guardian-create-account',
  templateUrl: './guardian-create-account.component.html',
  styleUrls: ['./guardian-create-account.component.scss']
})
export class GuardianCreateAccountComponent implements OnInit {
	// Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
	email = new FormControl('', [Validators.required, Validators.email]);
	password = new FormControl('', Validators.required);
	verificationPass = new FormControl('', Validators.required)

	error$ = this.store.pipe(select(getError));

	showSamePasswordError: boolean = false;

	constructor(public userAuthService: AuthService, public store: Store<AppState>, public router: Router) {}

	ngOnInit() {}

	async handleAuthenticate(e: Event) {
		e.preventDefault()

		// Check to make sure the passwords are the same
		if (this.password.value !== this.verificationPass.value) {
			this.showSamePasswordError = true
			return
		}

		if (this.email.valid && this.password.valid && this.verificationPass.valid) {
			this.store.dispatch(clearError())
			let user = await this.userAuthService.registerGuardian(this.email.value, this.password.value)
			if (user && typeof user !== 'boolean') {
				this.router.navigate(['guardian', new Guardian(user).uid ,'household', 'setup'])
			}
		}
	}

	clearPasswordError() {
		this.showSamePasswordError = false
	}
}
