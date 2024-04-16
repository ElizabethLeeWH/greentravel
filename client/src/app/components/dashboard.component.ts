import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { AuthService } from '../auth/auth.service';
import { TripHeader } from '../model';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PremiumSubscriptionDialogComponent } from './premium-subscription-dialog.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-about',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  userTripHeaders: TripHeader[] = [];
  private destroy$ = new Subject<void>();
  isLoggedIn$ = this.authService.isLoggedIn$;

  constructor(private apiService: ApiService, private authService: AuthService, private dialog: MatDialog, private router: Router, private snackbar: MatSnackBar) {}

  openPremiumSubscriptionDialog(): void {
    const dialogRef = this.dialog.open(PremiumSubscriptionDialogComponent, {
      width: '280px',
      height: '400px'
      // You can pass data or configuration here if needed
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   // Handle result if needed
    // });
  }

  ngOnInit() {
    this.loadTripHeaders();
    this.isLoggedIn$;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  settings(){
    console.log('go to settings');
  }

  loadTripHeaders() {
    this.apiService.getTripHeaders().pipe(takeUntil(this.destroy$)).subscribe({
      next: (tripHeaders) => {
        console.log('Trip Headers:', tripHeaders);
        this.userTripHeaders = tripHeaders;
      },
      error: (error) => {
        console.error('Error loading trip headers:', error);
      }
    });
  }

  removeTripHeader(tripId: string) {
    this.apiService.deleteTripHeader(tripId).subscribe({
      next: () => {
        console.log('Trip header removed successfully');
        this.userTripHeaders = this.userTripHeaders.filter(trip => trip.tripId !== tripId);
        this.snackbar.open('Delete successful','Undo', {
          duration: 3000
        })
        this.loadTripHeaders();
      },
      error: (error) => {
        console.error('Failed to remove trip header:', error);
        this.snackbar.open('Failed to delete trip header', 'Retry', {
          duration: 3000
        }).onAction().subscribe(() => {
          this.removeTripHeader(tripId);
        });
      }
    });
  }
  
}
