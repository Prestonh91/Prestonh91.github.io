import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { authRoutes as routes } from './auth.routes';


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
