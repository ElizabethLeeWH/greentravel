import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SignupDialogComponent } from '../signup-dialog.component';
import { Store } from '@ngxs/store';
import { Destination, TripHeader } from '../../model';
import { AddDestination } from '../../trip.state';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Observable, Subscription, first } from 'rxjs';
import { ApiService } from '../../api.service';
import { v4 as uuidv4 } from 'uuid';
import { dateRangeValidator, startDateValidator } from '../../validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginDialogComponent } from '../login-dialog.component';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent implements OnInit, AfterViewInit, OnDestroy {

  tripForm!: FormGroup;
  @ViewChild('autocompleteInput') autocompleteInput!: ElementRef;
  visibilityOptions: string[] = ['Public', 'Private', 'Friends'];
  isLoggedIn$: Observable<boolean>;
  private formChangesSubscription!: Subscription;
  error: boolean = false;
  email = new FormControl('', Validators.email);
  invitedEmails: string[] = [];

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private store: Store,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.tripForm = this.fb.group({
      destination: this.fb.group({
        country: ['', Validators.required],
        latitude: [''],
        longitude: ['']
      }),
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]]
    },
      { validators: Validators.compose([dateRangeValidator, startDateValidator]) }
    );
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  logout() {
    this.authService.logout();
  }

  openLoginDialog(fromHome: boolean = true): void {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '280px',
      height: '400px',
      data: { fromHome: fromHome }
      // You can pass data or configuration here if needed
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed by home component');
    //   // Handle result if needed
    // });
  }

  openSignupDialog(): void {
    const dialogRef = this.dialog.open(SignupDialogComponent, {
      width: '280px',
      height: '400px'
      // You can pass data or configuration here if needed
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   // Handle result if needed
    // });
  }

  showToastMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

  onSubmit(): void {
    if (this.tripForm.valid) {
      const formValue: TripHeader = this.tripForm.value;
      console.log(formValue);
      this.isLoggedIn$.pipe(first()).subscribe(isLoggedIn => {
        if (isLoggedIn) {
          const tripId = uuidv4();
          formValue.tripId = tripId;
          formValue.tripName = `Trip to ${formValue.destination.country}`;
          const tripHeaderJson = JSON.stringify(formValue);
          if(this.invitedEmails.length > 0){
            this.apiService.inviteTripmate(this.invitedEmails, tripId).subscribe({
              next: resp => {
                console.log('Email sent successfully', resp)
              },
              error: error => {
                console.log('Error sending email:', error)
              }
            });
          }
         
          this.apiService.createTripHeader(tripHeaderJson).subscribe({
            next: (resp) => {
              console.log('Response received:', resp);
              this.router.navigate(['/plan', tripId])
            },
            error: (error) => {
              console.error('Failed to create trip header', error);
            }
          });
        } else {
          const dialogRef = this.dialog.open(SignupDialogComponent, {
            width: '280px',
            height: '400px',
            data: {
              showSkipOption: true,
              showLoginOption: true,
              tripHeader: formValue,
              invitedTripmates: this.invitedEmails
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result === 'skip') {
            } else if (result === 'signUp') {
              console.log("signup")
            }
          });
        }
      });
    } else {
      if (this.tripForm.errors) {
        if (this.tripForm.errors['startDateInvalid']) {
          this.showToastMessage('Start Date cannot be later than today.');
        }
        if (this.tripForm.errors['dateRangeInvalid']) {
          this.showToastMessage('End Date must be later than Start Date.');
        }
      }
    }
  }

  ngOnInit(): void {
    this.formChangesSubscription = this.tripForm.statusChanges.subscribe(status => {
      console.log('Form Status:', status);
      console.log('Form Errors:', this.tripForm.errors);
      if (this.tripForm.errors) {
        if (this.tripForm.errors['startDateInvalid']) {
          console.log('startdate');
        }
        if (this.tripForm.errors['dateRangeInvalid']) {
          console.log('enddate');
        }
        this.cdr.detectChanges(); // Trigger change detection
      }
    });
    console.log("Start Date Control:", this.tripForm.get('startDate'));
  }

  ngOnDestroy(): void {
    this.formChangesSubscription.unsubscribe;
  }

  ngAfterViewInit(): void {
    this.initAutocomplete();
  }

  initAutocomplete(): void {
    const autocomplete = new google.maps.places.Autocomplete(this.autocompleteInput.nativeElement, { types: ['geocode'] });
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        console.error('No details available for input: ' + place.name);
        return;
      }

      if (place.geometry && place.geometry.location) {
        const destination: Destination = {
          country: place.name || "Unknown",
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        };
        this.tripForm.patchValue({ destination });
        this.store.dispatch(new AddDestination(destination));
      } else {
        console.error('Place has no geometry');
      }
    });
  }

  inviteTripMates(): void {
    console.log('Invite trip mates logic goes here', this.email.value);
    if (this.email.valid && this.email.value !== null) {
      this.invitedEmails.push(this.email.value);
      this.email.reset();
    }
  }

}
