import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormControl, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { clearError, getError } from 'src/store/api/api.store';
import { AppState } from 'src/store/app.state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-guardian',
  templateUrl: './auth-guardian.component.html',
  styleUrls: ['./auth-guardian.component.scss'],
})
export class AuthGuardianComponent implements OnInit {
	email = new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)]);
	password = new FormControl('', Validators.required);
	verificationPass = new FormControl('', Validators.required)

	error$ = this.store.pipe(select(getError));

	showCreateAccount: boolean = false;
	showSamePasswordError: boolean = false;

	constructor(public userAuthService: AuthService, public store: Store<AppState>, public router: Router) {}

	ngOnInit() {}

	async handleAuthenticate(e: Event) {
		e.preventDefault()
		if (this.email.valid && this.password.valid) {
			this.store.dispatch(clearError())
			if (this.showCreateAccount && this.verificationPass.valid) {
				if (this.password.value !== this.verificationPass.value) {
					this.showSamePasswordError = true
				}
				(await this.userAuthService.registerGuardian(this.email.value, this.password.value)).subscribe(user => {
					if (user)
						this.router.navigate(['guardian'])
				})
			}

			if (!this.showCreateAccount)
				(await this.userAuthService.loginGuardian(this.email.value, this.password.value))
				.subscribe(user => {
					if (user) {
						this.router.navigate(['guardian'])
					}
				})
		}
	}

	clearPasswordError() {
		this.showSamePasswordError = false
	}

	toggleCreateOrLogin() {
		this.showCreateAccount = !this.showCreateAccount
		this.password.setValue('')
		this.verificationPass.setValue('')
		this.resetForm()
	}

	resetForm() {
		this.password.reset()
		this.verificationPass.reset()
	}
}