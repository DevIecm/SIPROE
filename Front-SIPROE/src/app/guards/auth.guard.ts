import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';

@Injectable({
    providedIn: 'root'
  })
  export class AuthGuard implements CanActivate {
  
    constructor(private router: Router) {}
  
    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): boolean | UrlTree {
      const token = sessionStorage.getItem('key');
      if (token) {
        return true;
      } else {
        // redirige al login si no hay token
        return this.router.createUrlTree(['']);
      }
    }
  }