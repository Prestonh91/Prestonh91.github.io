import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { GuardianLoginComponent } from './auth-guardian/guardian-login/guardian-login.component';
import { GuardianCreateAccountComponent } from './auth-guardian/guardian-create-account/guardian-create-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GuardianHouseholdSetupComponent } from './auth-guardian/guardian-household-setup/guardian-household-setup.component';
import { AuthWardComponent } from './auth-ward/auth-ward.component';


@NgModule({
	declarations: [
		GuardianLoginComponent,
		GuardianCreateAccountComponent,
		GuardianHouseholdSetupComponent,
		AuthWardComponent,
	],
	imports: [
		CommonModule,
		AuthRoutingModule,
		ReactiveFormsModule,
	],
})
export class AuthModule { }
