import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivate } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, from, Observable } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { AppState } from 'src/store/app.state';
import { selectGuardian, setGuardian } from 'src/store/guardian/guardian.store';
import { Guardian } from '../classes/Guardian';

@Injectable({
  providedIn: 'root'
})
export class GuardianGuard implements CanActivate, CanActivateChild {
	private user$ = this.store.pipe(
		select(selectGuardian),
		tap(user => {
			if (!user?.uid) {
				this.fireAuth.user.subscribe(fbUser => {
					if (fbUser?.uid) {
						this.fireDb.object(`guardians/${fbUser.uid}`).query.once('value').then((dbUser: any) => {
							if (dbUser.val())
								this.store.dispatch(setGuardian({ guardian: new Guardian(dbUser.val())}))
						})
					}
					else {
						var sessionUser = sessionStorage.getItem('user')
						if (sessionUser)
							this.store.dispatch(setGuardian({ guardian: new Guardian(JSON.parse(sessionUser))}))
					}
				})
			}
		}),
		// filter((user: any) => user.uid !== null)
	)

	constructor(public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase, private router: Router, public store: Store<AppState>) {}

	canActivate(
    	route: ActivatedRouteSnapshot,
    	state: RouterStateSnapshot): Observable<boolean | UrlTree>
	{
		return combineLatest([this.fireAuth.user, this.user$])
		.pipe(
			map((values) => {
				var loggedInUser = values[0]
				var storedUser = values[1]

				if (loggedInUser && storedUser.guardianPin) {
					return true
				}
				else
					return this.router.parseUrl('/auth-guardian')
			}),
		)
  	}

	  canActivateChild(
    	route: ActivatedRouteSnapshot,
    	state: RouterStateSnapshot): Observable<boolean | UrlTree>
	{
		return this.canActivate(route, state)
	}
}
