import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { wardRoutes } from './ward/ward-routing'
import { guardianRoutes} from './guardian/guardian-routes'
import { authRoutes } from './auth/auth.routes';

const routes: Routes = [
	...wardRoutes,
	...guardianRoutes,
	...authRoutes,
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
