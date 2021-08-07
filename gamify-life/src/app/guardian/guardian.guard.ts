import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { AppState } from 'src/store/app.state';
import { setUser } from 'src/store/user/user-auth.actions';
import { selectUser } from 'src/store/user/user-auth.selectors';
import { UserAuth } from '../classes/user';

@Injectable({
  providedIn: 'root'
})
export class GuardianGuard implements CanActivate {
	private user$ = this.store.pipe(
		select(selectUser),
		tap(user => {
			if (!user?.uid) {
				this.fireAuth.user.subscribe(fbUser => {
					if (fbUser?.uid) {
						this.fireDb.object(`guardians/${fbUser.uid}`).valueChanges().subscribe((dbUser: any) => {
							this.store.dispatch(setUser({ user: new UserAuth(dbUser)}))
						})
					}
					else {
						var sessionUser = sessionStorage.getItem('user')
						if (sessionUser)
							this.store.dispatch(setUser({ user: new UserAuth(JSON.parse(sessionUser))}))
					}
				})
			}
		}),
		filter((user: any) => user.uid !== null)
	)

	constructor(public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase, private router: Router, public store: Store<AppState>) {}

	canActivate(
    	route: ActivatedRouteSnapshot,
    	state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
	{
		return combineLatest([this.fireAuth.user, this.user$])
		.pipe(
			map((values) => {
				var loggedInUser = values[0]
				var storedUsed = values[1]

				if (loggedInUser && storedUsed.guardianPin) {
					return true
				}
				else
					return this.router.parseUrl('auth')
			}),
		)
  	}

}
