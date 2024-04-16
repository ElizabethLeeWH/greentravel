import { CanActivateFn, CanDeactivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { inject } from "@angular/core";
import { UserplansComponent } from "../components/userplans/userplans.component";
import { map, tap } from "rxjs";

export const checkIfAuthenticated: CanActivateFn = 
    (_route, _state) => {
        const authSvc = inject(AuthService);
        const route = inject(Router);
        console.info('in authguard');
        return authSvc.isLoggedIn$.pipe(
            map(isLoggedIn => {
                if (!isLoggedIn) {
                    return route.parseUrl('/');
                }
                return true; 
            })
        );
    }

export const hasSaved: CanDeactivateFn<UserplansComponent> = 
    (comp, _route, _state) => {
        if(comp.tripHeaderForm.dirty){
            return confirm('Your progress will not be saved if you are not logged in.\nAre you sure you want to leave?');
        }
        return true;
    }