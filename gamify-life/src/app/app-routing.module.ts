import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { wardRoutes } from './ward/ward-routing'
import { guardianRoutes} from './guardian/guardian-routes'
import { authRoutes } from './auth/auth.routes';

const routes: Routes = [
	{ path : '', redirectTo: '/auth-guardian', pathMatch: 'full'},
	...wardRoutes,
	...guardianRoutes,
	...authRoutes,
	{ path: '**', redirectTo: '/auth-guardian' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
