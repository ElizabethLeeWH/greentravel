import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentInfo, StripeCardEvent } from '../model';
import { PaymentService } from '../payment.service';

declare var Stripe: any;

@Component({
  selector: 'app-premium-subscription-dialog',
  templateUrl: './premium-subscription-dialog.component.html',
  styleUrl: './premium-subscription-dialog.component.css'
})
export class PremiumSubscriptionDialogComponent implements OnInit, OnDestroy {
  @ViewChild('cardInfo', { static: false }) cardInfo!: ElementRef;

  private card: any;
  private stripe: any;
  cardHandler = this.onChange.bind(this);
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<PremiumSubscriptionDialogComponent>,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    console.log(this.cardInfo);
    this.stripe = Stripe('pk_test_51P5y4GFRQ9MSARMxVke9GRLi9OQS6XYBde17pB41oEKtuWfNH1U8gjySpdITOhHDQd64z2p1tMh8ftkbfDWKGIQQ00MYh5krwS');
    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount(this.cardInfo.nativeElement);
    this.card.addEventListener('change', this.cardHandler);

  }

  ngOnDestroy(): void {
    this.card.removeEventListener('change', this.cardHandler);
    this.card.destroy();
  }

  onChange(event: StripeCardEvent): void {
    if (event.error) {
      this.error = event.error.message;
    } else {
      this.error = null;
    }
  }

  async subscribeToPremium() {
    // const token = "tok_visa";
    // const amount = 999;
    // this.apiService.chargeCreditCard(token, amount).subscribe({
    //   next: (response) => {
    //     console.log('Subscription successful:', response);
    //     this.dialogRef.close();
    //     this.showSuccessMessage('Subscription successful!');
    //   },
    //   error: (error) => {
    //     console.error('Subscription failed:', error);
    //     this.showErrorMessage('Subscription unsuccessful!');
    //   }
    // })
    let urls: PaymentInfo = {
      successUrl: 'premium-success',
      cancelUrl: 'premium-cancel'
    };
    this.paymentService.goToPayment(urls).catch(err => {
      console.log(">> PremiumPayment: Error occurred", err);
    });
    
  }


  showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
