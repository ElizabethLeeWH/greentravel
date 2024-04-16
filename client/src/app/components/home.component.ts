import { Component, HostListener, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { User } from '../model';
import { LoginDialogComponent } from './login-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SignupDialogComponent } from './signup-dialog.component';
import { AuthService } from '../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  user: User = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    newsletterStatus: true
  };

  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private email!: string;
  private password!: any;

  loginForm!: FormGroup;
  newsletter!: FormGroup;
  signUpForm!: FormGroup;
  isLoggedIn$ = this.authService.isLoggedIn$;

  ngOnInit(): void {
    this.newsletter = this.fb.group({
      email: this.fb.control<string>('', [Validators.required, Validators.email])
    })
  }

  logout() {
    this.authService.logout();
  }

  onSubmit() {
    if(this.newsletter.valid){
      this.apiService.sendEmail(this.newsletter.value.email).subscribe({
        next: resp => {
          console.log('Email sent successfully', resp)
          this.snackBar.open("You've successfully subscribed to our newsletter :-)", 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          })
        },
        error: error => {
          console.log('Error sending email:', error)
          this.snackBar.open("Error subscribing to our newsletter :-(", 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          })
        }
      });
    }
    
  }

  login(): void {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      this.apiService.login(formValue)
        .subscribe({
          next: (response) => {
            console.log('Login successful', response);
          },
          error: (error) => {
            console.error('Login failed', error);
          }
        });
    } else {
      console.log('Login form is invalid');
    }
  }

  constructor(public dialog: MatDialog, private snackBar: MatSnackBar) { }

  openLoginDialog(fromHome: boolean = true): void {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '280px',
      height: '400px',
      data: {fromHome: fromHome}
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed by home component');
    // });
  }

  openSignupDialog(): void {
    const dialogRef = this.dialog.open(SignupDialogComponent, {
      width: '280px',
      height: '400px'
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    // });
  }
}
