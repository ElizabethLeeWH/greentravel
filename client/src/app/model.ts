export interface StripeCardEvent {
    complete: boolean;
    error?: StripeError;
}

export interface StripeError {
    message: string;
    code?: string;
    type?: string;
    param?: string;
}

export interface User {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    newsletterStatus: boolean;
}

export interface TripHeader {
    tripId: string;
    destination: Destination;
    tripCoverPhoto?: string; //s3 bucket?
    tripName: string;
    startDate?: Date;
    endDate?: Date;
}

export interface TripStateModel {
    currentTrip: Trip | null;
    destinations: Destination[];   // Ensure destinations are typed as an array
    tripHeader: TripHeader | null;  // Use TripHeader type and consider it can be null
    itinerary: Itinerary | null;    // Itinerary can also be initially null
    tripList: Trip[];   // Array of Trip as defined
    budget: Budget | null;     // Budget can be initially null
}

export interface Destination {
    country: string;
    latitude: number;
    longitude: number;
}

export interface Trip {
    header: string;
    items: TripItem[];
}

export interface TripItem {
    id: string;
    type: 'place' | 'note';
    content: Place | Note;
}

export interface Place {
    nameOfPlace: string;
    description?: string;
}

export interface Note {
    text: string;
}

export interface Itinerary {
    dates: ItineraryDate[];
}

export interface ItineraryDate {
    date: Date;
    places: Destination[];
}

export interface Budget {
    currency: string; //do smth about this either currency: Currency or string
    totalBudget: number;
    expenses: Expense[];
}

export interface Expense {
    id: number;
    category: BudgetCategory;
    currency: string;
    amount: number;
    date: Date;
    paidBy: string;
    splitWith: string[];
}

export interface BudgetCategory {
    name: string;
}

export interface Currency {
    code: string;
    name: string;
}

export interface PaymentInfo {
    successUrl: string
    cancelUrl: string
}

// export interface Accommodation {
//     accommodationId: number;
//     tripId: number;
//     name: string;
//     checkIn: Date;
//     checkOut: Date;
//     location?: string;
//     bookingReference?: string;
//     note?: string;
// }

// export interface Transportation {
//     transportationId: number;
//     tripId: number;
//     type: string;
//     departureDatetime: Date;
//     arrivalDatetime: Date;
//     origin: string;
//     destination: string;
//     bookingReference?: string;
//     note?: string;
// }

