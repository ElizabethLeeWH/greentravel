import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from './environments/environment.prod';
import { PaymentInfo } from './model';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    private baseUrl = "https://thetravelcompanion.up.railway.app/api";

    constructor(private http: HttpClient) {}

    async goToPayment(urls: PaymentInfo): Promise<any> {
        try {
            const stripe = Stripe('pk_test_51P5y4GFRQ9MSARMxVke9GRLi9OQS6XYBde17pB41oEKtuWfNH1U8gjySpdITOhHDQd64z2p1tMh8ftkbfDWKGIQQ00MYh5krwS');
            const session = await firstValueFrom(this.http.post<any>(`${this.baseUrl}/checkout`, urls));
            const sessionId = session.sessionId;
            return stripe.redirectToCheckout({ sessionId });
        } catch (err) {
            console.error("Error during the redirection to Stripe checkout: ", err);
        }
    }
}
