import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Guardian } from 'src/app/classes';

@Injectable({
  providedIn: 'root'
})
export class GuardianHouseholdGuard implements CanActivate {
	constructor(private fireAuth: AngularFireAuth, private fireDb: AngularFireDatabase, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.fireAuth.user.pipe(
			mergeMap(x => {
				if (x?.uid) {
					return this.fireDb.object(`guardians/${x.uid}`).valueChanges()
				}
				return of(null)
			}),
			map((user : Guardian | any) => {
				if (!user) {
					return this.router.parseUrl('/guardian/login')
				}
				let g = new Guardian(user)
				if (Object.keys(g.households).length === 0) return true
				if (Object.keys(g.households).length > 0) {
					return true
					// return this.router.parseUrl('/guardian')
				}

				return this.router.parseUrl('/guardian/login')
			})
		)
	}

}
