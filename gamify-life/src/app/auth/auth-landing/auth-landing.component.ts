import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormControl, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { clearError, getError } from 'src/store/api/api.store';
import { AppState } from 'src/store/app.state';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-auth-landing',
  templateUrl: './auth-landing.component.html',
  styleUrls: ['./auth-landing.component.scss'],
})
export class AuthLandingComponent implements OnInit {
	email = new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)]);
	password = new FormControl('', Validators.required);
	verificationPass = new FormControl('', Validators.required)

	error$ = this.store.pipe(select(getError));

	showCreateAccount: boolean = false;

	constructor(public userAuthService: AuthService, public store: Store<AppState>) {}

	ngOnInit() {}

	handleAuthenticate(e: Event) {
		e.preventDefault()
		if (this.email.valid && this.password.valid) {
			this.store.dispatch(clearError())
			if (this.showCreateAccount && this.verificationPass.valid) {
				if (this.password.value !== this.verificationPass.value) return
				this.userAuthService.registerGuardian(this.email.value, this.password.value)
			}

			if (!this.showCreateAccount)
				this.userAuthService.loginUser(this.email.value, this.password.value)
		}
	}

	toggleCreateOrLogin() {
		this.showCreateAccount = !this.showCreateAccount
		this.email.setValue('')
		this.password.setValue('')
		this.verificationPass.setValue('')
	}
}
