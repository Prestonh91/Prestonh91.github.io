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

	constructor(public userAuthService: AuthService, public store: Store<AppState>, public router: Router) {}

	ngOnInit() {}

	async handleAuthenticate(e: Event) {
		e.preventDefault()
		if (this.email.valid && this.password.valid) {
			this.store.dispatch(clearError())
			if (this.showCreateAccount && this.verificationPass.valid) {
				if (this.password.value !== this.verificationPass.value) return
				this.userAuthService.registerGuardian(this.email.value, this.password.value)
			}

			if (!this.showCreateAccount)
				(await this.userAuthService.loginUser(this.email.value, this.password.value)).subscribe(user => {
					if (user) {
						this.router.navigate(['guardian'])
					}
				})
		}
	}

	toggleCreateOrLogin() {
		this.showCreateAccount = !this.showCreateAccount
		this.email.setValue('')
		this.password.setValue('')
		this.verificationPass.setValue('')
	}
}
