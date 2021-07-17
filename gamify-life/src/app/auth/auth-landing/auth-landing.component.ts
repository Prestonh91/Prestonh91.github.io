import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-auth-landing',
  templateUrl: './auth-landing.component.html',
  styleUrls: ['./auth-landing.component.scss'],
})
export class AuthLandingComponent implements OnInit {
	email = new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)]);
	password = new FormControl('', Validators.required);

	constructor(public userAuthService: AuthService) { 

	}

	ngOnInit() {
		//   this.userAuthService.registerGuardian('preston.higgins91@gmail.com', 'somesecurepassword');
	}

	registerGuardian() {
		if (this.email.valid && this.password.valid) {
			this.userAuthService.registerGuardian(this.email.value, this.password.value)
		}
	}
}
