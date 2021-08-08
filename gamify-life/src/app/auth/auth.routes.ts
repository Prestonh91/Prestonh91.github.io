import { AuthGuardianComponent } from "../auth/auth-guardian/auth-guardian.component";
import { AuthWardComponent } from "./auth-ward/auth-ward.component";

export const authRoutes = [
	{ path: 'auth-guardian', component: AuthGuardianComponent },
	{ path: 'auth-ward', component: AuthWardComponent }
]