import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngxs/store';
import { UpdateTripHeader } from '../trip.state';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.css'
})
export class LoginDialogComponent implements OnInit {
  loginForm!: FormGroup;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  constructor(public dialogRef: MatDialogRef<LoginDialogComponent>, private router: Router,
    private snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) public data: any, private store: Store, private apiService: ApiService) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: this.fb.control<string>('', [Validators.required, Validators.email]),
      password: this.fb.control<string>('', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$')])
    })
  }

  login(): void {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      this.authService.login(formValue)
        .subscribe({
          next: (response) => {
            console.log('Login successful', response);
            this.dialogRef.close();
            const tripId = uuidv4();
            const redirectRoute = this.data.fromHome ? '/dashboard' : '/plan/' + tripId;
            if(this.data.fromCreate){
              const initialTripHeader = {
                tripId: tripId,
                destination: this.data.destination,
                tripName: `Trip to ${this.data.destination.country}`,
                startDate: this.data.startDate,
                endDate: this.data.endDate
              };
              this.apiService.createTripHeader(initialTripHeader);
            }
            
            this.router.navigate([redirectRoute]);
          },
          error: (error) => {
            console.error('Login failed', error);
            this.snackBar.open('Login failed: Incorrect email or password', 'Close', {
              duration: 3000,
            });
          }
        });
    } else {
      this.snackBar.open('Please fill out the form correctly.', 'Close', {
        duration: 3000,
      });
    }
  }
}
