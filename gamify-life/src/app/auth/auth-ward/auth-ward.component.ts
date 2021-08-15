import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth/auth.service';
import { getError } from 'src/store/api/api.store';
import { AppState } from 'src/store/app.state';

@Component({
  selector: 'app-auth-ward',
  templateUrl: './auth-ward.component.html',
  styleUrls: ['./auth-ward.component.scss']
})
export class AuthWardComponent implements OnInit {
	email = new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)])
	password = new FormControl('', Validators.required)
	verificationPass = new FormControl('', Validators.required)
	guardianId = new FormControl('', Validators.required)

	error$ = this.store.pipe(select(getError))

	showCreateAccount: boolean = false;

	constructor(public authService: AuthService, public store: Store<AppState>, public router: Router) { }

	ngOnInit(): void {
	}

	async handleAuthenticate(e: Event) {
		e.preventDefault()
		this.email.markAsTouched()
		if (this.showCreateAccount) {
			this.email.markAsTouched()
			this.password.markAsTouched()
			this.verificationPass.markAsTouched()
			this.guardianId.markAsTouched()
			if (this.email.valid && this.password.valid && this.verificationPass.valid && this.guardianId.valid) {
				await this.authService.registerWard(this.email.value, this.password.value, this.guardianId.value)
				this.router.navigate(['ward'])
			}
		} else {
			this.email.markAsTouched()
			this.password.markAsTouched()
			if (this.email.valid && this.password.valid) {
				(await this.authService.loginWard(this.email.value, this.password.value)).subscribe(x => this.router.navigate(['ward']))
			}
		}
	}

	toggleCreateOrLogin() {
		this.showCreateAccount = !this.showCreateAccount
		this.password.setValue('')
		this.verificationPass.setValue('')
		this.guardianId.setValue('')
		this.resetEntireForm()
	}

	resetEntireForm() {
		this.password.reset()
		this.verificationPass.reset()
		this.guardianId.reset()
	}
}
