import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { DashboardComponent } from './components/dashboard.component';
import { CreateComponent } from './components/create/create.component';
import { UserplansComponent } from './components/userplans/userplans.component';
import { checkIfAuthenticated, hasSaved } from './auth/auth.guards';
import { SuccessComponent } from './payment/success.component';
import { CancelComponent } from './payment/cancel.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [checkIfAuthenticated]},
  {path: 'plan/create', component: CreateComponent},
  {path: 'plan/:tripId', component: UserplansComponent, canDeactivate: [hasSaved]},
  { path: 'premium-success', component: SuccessComponent },
  { path: 'premium-cancel', component: CancelComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
