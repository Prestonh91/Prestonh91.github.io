import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class GuardianGuard implements CanActivate, CanActivateChild {
	constructor(public fireAuth: AngularFireAuth, public fireDb: AngularFireDatabase, private router: Router) {}

	canActivate(
    	route: ActivatedRouteSnapshot,
    	state: RouterStateSnapshot): any
	{
		return this.fireAuth.user.pipe(
			mergeMap(user => {
				if (user?.uid) {
					return this.fireDb.object(`guardians/${user.uid}`).valueChanges()
				}
				return of(user)
			}),
			map((x: any) => {
				if (x?.guardianPin) {
					return true
				} else {
					return this.router.parseUrl('/guardian/login')
				}
			})
		)
  	}

	  canActivateChild(
    	route: ActivatedRouteSnapshot,
    	state: RouterStateSnapshot): Observable<boolean | UrlTree>
	{
		return this.canActivate(route, state)
	}
}
