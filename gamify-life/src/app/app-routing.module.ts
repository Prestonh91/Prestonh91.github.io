import { NgModule, OnInit } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { wardRoutes } from './ward/ward-routing'
import { guardianRoutes} from './guardian/guardian-routes'
import { authRoutes } from './auth/auth.routes';
import { Store } from '@ngrx/store';
import { AppState } from 'src/store/app.state';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { setUser } from 'src/store/user/user-auth.actions';
import { Guardian } from './classes/Guardian';

const routes: Routes = [
	{ path : '', redirectTo: '/auth-guardian', pathMatch: 'full'},
	...wardRoutes,
	...guardianRoutes,
	...authRoutes,
	{ path: '*', redirectTo: '/auth-guardian' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule implements OnInit {
	constructor(public store: Store<AppState>, public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase) {}

	ngOnInit() {
		this.fireAuth.user.subscribe(user => {
			if (user) {
				this.fireDb.object(`guardians/${user.uid}`).valueChanges().subscribe((x:any) => {
					this.store.dispatch(setUser({ user: new Guardian(x)}))
				})
			} else {
				var sessionUser = sessionStorage.getItem('user')
				if (sessionUser) {
					var loggedInUser = new Guardian(JSON.parse(sessionUser))
					this.store.dispatch(setUser({ user: loggedInUser }))
				}
			}

			sessionStorage.removeItem('user')
		})
	}
}
