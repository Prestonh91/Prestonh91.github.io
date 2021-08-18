import { GuardianLayoutComponent } from "./guardian-layout/guardian-layout.component";
import { GuardianSummaryComponent } from "./guardian-summary/guardian-summary.component";
import { GuardianGuard } from "./guardian.guard";

export const guardianRoutes = [
	{
		path: 'guardian',
		// canActivateChild: [GuardianGuard],
		canActivate: [GuardianGuard],
		component: GuardianLayoutComponent,
		children: [
			{ path: 'summary', component: GuardianSummaryComponent }
		],
	}
]