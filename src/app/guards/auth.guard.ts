import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { map, Observable } from "rxjs";
import { Router ,UrlTree } from "@angular/router";


@Injectable({
    providedIn: 'root'
})

export class AuthGuard {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(): Observable<boolean | UrlTree> {
        return this.authService.isAuthenticated$.pipe(
            map(isValid => isValid || this.router.createUrlTree(['/login']))
        )
    }
}