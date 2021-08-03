import { GuardianLayoutComponent } from "./guardian-layout/guardian-layout.component";
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToAuth = () => redirectUnauthorizedTo(['auth'])

export const guardianRoutes = [
	{ path: 'guardian', component: GuardianLayoutComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToAuth }}
]