import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../api.service';
import { v4 as uuidv4 } from 'uuid';
import { Router } from '@angular/router';
import { LoginDialogComponent } from './login-dialog.component';
import { PremiumSubscriptionDialogComponent } from './premium-subscription-dialog.component';
import { Store } from '@ngxs/store';
import { UpdateTripHeader } from '../trip.state';
import { AuthService } from '../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup-dialog',
  templateUrl: './signup-dialog.component.html',
  styleUrl: './signup-dialog.component.css'
})
export class SignupDialogComponent implements OnInit {
  signupForm!: FormGroup;
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);
  showSkipOption: boolean;
  showLoginOption: boolean;
  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<SignupDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private store: Store, private authService: AuthService, private snackbar: MatSnackBar ) {
    this.showSkipOption = data?.showSkipOption ?? false;
    this.showLoginOption = data?.showLoginOption ?? false;
  }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$')]],
      newsletterStatus: [false, [Validators.required]]
    });
  }

  signup(): void {
    console.log("im here at signup method")
    if (this.signupForm.valid) {
      const formValue = this.signupForm.value;
      this.apiService.signUp(formValue)
        .subscribe({
          next: (response) => {
            console.log('Sign up successful', response);
            this.authService.login(formValue).subscribe({
              next: (response) => {
                console.log('Login from signing up successful', response);
                this.snackbar.open('You are now logged in', 'Close', { duration: 3000 });
                this.dialogRef.close();
                this.openPremiumSubscriptionDialog;
              }, error: (error) => {
                console.log('Login after sign up failed', error);
                this.snackbar.open('Login failed: ' + error.message, 'Retry', { duration: 3000 });
              }});
            
          },
          error: (error) => {
            console.error('Sign up failed', error);
          }
        });
      this.dialogRef.close();
    } else {
      console.log('Sign up form is invalid');
    }
  }

  openPremiumSubscriptionDialog(): void {
    const dialogRef = this.dialog.open(PremiumSubscriptionDialogComponent, {
      width: '280px',
      height: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Premium subscription skipped');
    });
  }

  skipSignUp() {
    const tripId = uuidv4();
    const initialTripHeader = {
      tripId: tripId,
      // userId: 'exampleUserId', 
      destination: this.data.tripHeader.destination,
      tripName: `Trip to ${this.data.tripHeader.destination.country}`,
      startDate: this.data.tripHeader.startDate,
      endDate: this.data.tripHeader.endDate
    };
    console.log(initialTripHeader);
    this.store.dispatch(new UpdateTripHeader(initialTripHeader));
    this.router.navigate(['/plan', tripId])
    this.dialogRef.close('skip');
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '280px',
      height: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
