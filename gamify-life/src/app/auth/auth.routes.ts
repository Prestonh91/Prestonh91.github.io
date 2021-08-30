import { Routes } from "@angular/router";
import { GuardianCreateAccountComponent } from "./auth-guardian/guardian-create-account/guardian-create-account.component";
import { GuardianHouseholdSetupComponent } from "./auth-guardian/guardian-household-setup/guardian-household-setup.component";
import { GuardianLoginComponent } from "./auth-guardian/guardian-login/guardian-login.component";
import { GuardianHouseholdGuard } from "./auth-guardian/guards/guardian-household.guard";
import { AuthWardComponent } from "./auth-ward/auth-ward.component";

export const authRoutes : Routes = [
	{ path: 'guardian/login', component: GuardianLoginComponent },
	{ path: 'guardian/create', component: GuardianCreateAccountComponent},
	{ path: 'guardian/:uid/household/setup', canActivate: [GuardianHouseholdGuard], component: GuardianHouseholdSetupComponent },
	{ path: 'auth-ward', component: AuthWardComponent }
]