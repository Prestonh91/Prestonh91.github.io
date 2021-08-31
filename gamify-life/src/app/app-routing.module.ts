import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { wardRoutes } from './ward/ward-routing'
import { guardianRoutes} from './guardian/guardian-routes'

const routes: Routes = [
	{ path : '', redirectTo: 'guardian/login', pathMatch: 'full'},
	...wardRoutes,
	...guardianRoutes,
	{ path: '**', redirectTo: 'guardian/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
