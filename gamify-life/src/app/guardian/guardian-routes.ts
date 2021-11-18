import { GuardianHouseholdComponent } from "./guardian-household/guardian-household.component";
import { GuardianLayoutComponent } from "./guardian-layout/guardian-layout.component";
import { GuardianPerksComponent } from "./guardian-perks/guardian-perks.component";
import { GuardianProfileComponent } from "./guardian-profile/guardian-profile.component";
import { GuardianSummaryComponent } from "./guardian-summary/guardian-summary.component";
import { GuardianGuard } from "./guardian.guard";

export const guardianRoutes = [
	{
		path: 'guardian',
		redirectTo: 'guardian/summary'
	},
	{
		path: 'guardian',
		canActivateChild: [GuardianGuard],
		canActivate: [GuardianGuard],
		component: GuardianLayoutComponent,
		children: [
			{ path: 'summary', component: GuardianSummaryComponent },
			{ path: 'perks', component: GuardianPerksComponent },
			{ path: 'profile', component: GuardianProfileComponent },
			{ path: 'household/:hhUid', component: GuardianHouseholdComponent }
		],
	},
]