import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home.component';
import { DashboardComponent } from './components/dashboard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { GoogleMapsModule } from '@angular/google-maps';
import { CreateComponent } from './components/create/create.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatSnackBarModule} from '@angular/material/snack-bar'
import { MatExpansionModule } from '@angular/material/expansion';
import { UserplansComponent } from './components/userplans/userplans.component';
import { ApiService } from './api.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { LoginDialogComponent } from './components/login-dialog.component';
import { SignupDialogComponent } from './components/signup-dialog.component';
import { NgxsModule } from '@ngxs/store';
import { TripState } from './trip.state';
import { PremiumSubscriptionDialogComponent } from './components/premium-subscription-dialog.component';
import { BudgetService } from './budget.service';
import { EditExpenseDialogComponent } from './components/edit-expense-dialog.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './customreusestrategy';
import { PaymentService } from './payment.service';
import { SuccessComponent } from './payment/success.component';
import { CancelComponent } from './payment/cancel.component';
import { StripeModule } from 'stripe-angular';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    CreateComponent,
    UserplansComponent,
    LoginDialogComponent,
    SignupDialogComponent,
    PremiumSubscriptionDialogComponent,
    EditExpenseDialogComponent,
    SuccessComponent,
    CancelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatSelectModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatIconModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatCardModule,
    MatSnackBarModule,
    GoogleMapsModule,
    MatCheckboxModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    NgxsModule.forRoot([TripState]),
    StripeModule.forRoot("")
  ],
  providers: [
    provideAnimationsAsync(),
    PaymentService,
    ApiService,
    BudgetService,
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
