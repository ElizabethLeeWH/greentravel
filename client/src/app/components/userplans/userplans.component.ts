import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SignupDialogComponent } from '../signup-dialog.component';
import { TripState, UpdateBudget, UpdateItinerary, UpdateTripHeader, UpdateTripList } from '../../trip.state';
import { Select, Store } from '@ngxs/store';
import { Budget, Currency, Destination, Itinerary, Trip, TripHeader } from '../../model';
import { Observable, Subject, catchError, combineLatest, debounceTime, map, switchMap, take, takeUntil, tap, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ApiService } from '../../api.service';
import { BudgetService } from '../../budget.service';
import { EditExpenseDialogComponent } from '../edit-expense-dialog.component';

@Component({
  selector: 'app-userplans',
  templateUrl: './userplans.component.html',
  styleUrl: './userplans.component.css'
})
export class UserplansComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('map') mapElement!: ElementRef;
  @ViewChild('autocompleteInput') autocompleteInput!: ElementRef;
  @Select(TripState.destinations) destinations$!: Observable<Destination[]>;
  @Select(TripState.tripHeader) tripHeader$!: Observable<TripHeader | null>;
  @Select(TripState.itinerary) itinerary$!: Observable<Itinerary | null>;
  @Select(TripState.tripList) tripList$!: Observable<Trip[]>;
  @Select(TripState.budget) budget$!: Observable<Budget | null>;

  tripHeaderForm!: FormGroup;
  tripListForm!: FormGroup;
  itineraryForm!: FormGroup;
  budgetForm!: FormGroup;
  expensesForm!: FormGroup;
  editExpensesForm!: FormGroup;
  currentlyEditingIndex!: number | null;

  isLoggedIn$ = this.authService.isLoggedIn$;
  destroy$ = new Subject<void>();
  private autocompleteInitialized = new Map<HTMLInputElement, boolean>();

  currencies!: Currency[];
  plans: any[] = [];
  itinerary: any[] = [];
  expenses: any[] = [];
  budgetCategories: string[] = []
  showCategoryInput: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private store: Store,
    private budgetService: BudgetService,

  ) {
    this.tripHeaderForm = this.createTripHeaderForm();

    this.tripListForm = this.createTripListForm();

    this.itineraryForm = this.createItineraryForm();

    this.budgetForm = this.createBudgetForm();
    this.expensesForm = this.createExpensesForm();
    this.editExpensesForm = this.createExpensesForm();
  }

  private createTripHeaderForm(): FormGroup {
    return this.fb.group({
      tripId: ['', Validators.required],
      destinationCountry: [''],
      latitude: [''],
      longitude: [''],
      tripName: ['', Validators.required],
      startDate: [null],
      endDate: [null]
    });
  }

  private createItineraryForm(): FormGroup {
    return this.fb.group({
      dates: this.fb.array([])
    });
  }

  private createItineraryDateForm(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      places: this.fb.array([])
    });
  }

  private createTripListForm(): FormGroup {
    return this.fb.group({
      tripList: this.fb.array([this.createTrip()])
    });
  }

  private createTrip(): FormGroup {
    return this.fb.group({
      header: 'Places to visit',
      items: this.fb.array([this.createTripContent])
    });
  }

  private createTripContent(type: 'place' | 'note'): FormGroup {
    let contentGroup = {};

    if (type === 'place') {
      contentGroup = {
        nameOfPlace: ['', Validators.required],
        description: ['']
      };
    } else if (type === 'note') {
      contentGroup = {
        text: ['']
      };
    }

    return this.fb.group({
      type: [type, Validators.required],
      content: this.fb.group(contentGroup)
    });
  }

  private createBudgetForm(): FormGroup {
    return this.fb.group({
      totalBudget: [''],
      currency: ['USD'],
      expenses: this.fb.array([])
    });
  }

  private createExpensesForm(): FormGroup {
    return this.fb.group({
      currency: ['USD'],
      amount: [''],
      category: [''],
      date: [null],
      paidBy: [''],
      splitWith: this.fb.array([]),
      newSplitWith: ['']
    });
  }

  addExpense(): void {
    const newExpenseData = {
      currency: this.expensesForm.value.currency,
      amount: this.expensesForm.value.amount,
      category: this.expensesForm.value.category,
      date: this.expensesForm.value.date,
      paidBy: this.expensesForm.value.paidBy,
      splitWith: this.prepareSplitWithForNewExpense(),
    };

    const newExpenseGroup = this.fb.group(newExpenseData);
    const expenses = this.budgetForm.get('expenses') as FormArray;
    expenses.push(newExpenseGroup);

    this.resetExpensesForm();
  }

  prepareSplitWithForNewExpense(): FormArray {
    const splitWithControls = (this.expensesForm.get('splitWith') as FormArray).controls;
    const splitWithValues = splitWithControls.map(control => control.value);
    return this.fb.array(splitWithValues);
  }

  resetExpensesForm(): void {
    this.expensesForm.reset({
      currency: 'USD',
      amount: '',
      category: '',
      date: null,
      paidBy: '',
      newSplitWith: '',
    });
    const splitWithArray = this.expensesForm.get('splitWith') as FormArray;
    while (splitWithArray.length > 0) {
      splitWithArray.removeAt(0);
    }
  }

  removeExpense(index: number) {
    const expenses = this.budgetForm.get('expenses') as FormArray;
    return expenses.removeAt(index);
  }


  editExpense(expense: any, index: number): void {
    console.log('Opening dialog with expense:', expense);
    const dialogRef = this.dialog.open(EditExpenseDialogComponent, {
      width: '400px',
      height: '800px',
      data: { expense: expense || { splitWith: [] } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed', result);
        this.updateExpense(index, result);
      }
    });
  }

  updateExpense(index: number, updatedExpense: any): void {
    const expenses = this.budgetForm.get('expenses') as FormArray;
    if (expenses && expenses.at(index)) {
      expenses.at(index).patchValue({
        currency: updatedExpense.currency,
        amount: updatedExpense.amount,
        category: updatedExpense.category,
        date: updatedExpense.date,
        paidBy: updatedExpense.paidBy
      });
      this.updateSplitWithArray(expenses.at(index) as FormGroup, updatedExpense.splitWith);
    }
  }

  updateSplitWithArray(expenseGroup: FormGroup, splitWith: string[]): void {
    const splitWithArray = expenseGroup.get('splitWith') as FormArray;

    while (splitWithArray.length !== 0) {
      splitWithArray.removeAt(0);
    }

    splitWith.forEach(splitEntry => {
      splitWithArray.push(this.fb.control(splitEntry));
    });
  }

  saveAll(): void {
    console.log(this.itineraryForm.value)
    this.isLoggedIn$.pipe(
      takeUntil(this.destroy$),
      switchMap(isLoggedIn => {
        if (!isLoggedIn) {
          return throwError(() => new Error('User not logged in'));
        }
        // Using switchMap to ensure that API calls are made only after it's confirmed the user is logged in
        return combineLatest([
          this.saveTripHeader(),
          this.saveItinerary(),
          this.saveBudget()
        ]).pipe(
          map(([headerResult, itineraryResult, budgetResult]) => {
            console.log('Trip header and itinerary saved:', headerResult, itineraryResult, budgetResult);
            return { headerResult, itineraryResult };
          })
        );
      }),
      catchError(error => {
        console.error('Error during save operations:', error);
        return throwError(() => error);
      })
    ).subscribe({
      next: results => console.log('All data saved successfully', results),
      error: error => console.error('Failed to save data:', error)
    });
  }

  private saveTripHeader() {
    const tripHeaderData = this.tripHeaderForm.value;
    const tripId = this.tripHeaderForm.get('tripId')?.value;
    if (!tripId) {
      console.error('Trip header ID is missing');
      return throwError(() => new Error('Trip header ID is missing'));
    }
    return this.apiService.saveTripHeader(tripHeaderData, tripId).pipe(
      tap({
        next: response => console.log('Trip header updated successfully', response),
        error: error => console.error('Failed to update trip header', error)
      }),
      catchError(error => {
        console.error('Error in saving trip header:', error);
        return throwError(() => error);
      })
    );
  }

  private saveItinerary(): Observable<any> {
    const tripId = this.tripHeaderForm.get('tripId')?.value;

    if (!tripId) {
      console.error('No trip ID provided');
      return throwError(() => new Error('No trip ID provided'));
    }
    console.log(this.itineraryForm.value)

    return this.apiService.saveItinerary(this.itineraryForm.value, tripId).pipe(
      tap({
        next: response => console.log('Itinerary saved successfully', response),
        error: error => console.error('Failed to save itinerary', error)
      }),
      catchError(error => {
        console.error('Error in saving itinerary:', error);
        return throwError(() => error);
      })
    );
  }

  private saveBudget(): Observable<any> {
    const tripId = this.tripHeaderForm.get('tripId')?.value;

    if (!tripId) {
      console.error('No trip ID provided');
      return throwError(() => new Error('No trip ID provided'));
    }
    console.log(this.budgetForm.value)
    const budget = this.budgetForm.value;
    return this.apiService.saveBudget(budget, tripId).pipe(
      tap(() => console.log('Budget saved successfully')),
      catchError(error => {
        console.error('Failed to save budget', error);
        return throwError(() => error);
      })
    );
  }

  saveEditedExpense(): void {
    const expenses = this.budgetForm.get('expenses') as FormArray;
    expenses.at(this.currentlyEditingIndex!).patchValue(this.editExpensesForm.value);
    this.editExpensesForm.reset({
      currency: 'USD',
      amount: '',
      category: '',
      date: null,
      paidBy: '',
      splitWith: ''
    });
    this.currentlyEditingIndex = null;
  }

  getSplitWithControls(): AbstractControl[] {
    return (this.expensesForm.get('splitWith') as FormArray).controls;
  }

  getSplitWithControlByIndex(index: number): FormArray {
    const expenseFormGroup = this.getExpenses().at(index) as FormGroup;
    return expenseFormGroup.get('splitWith') as FormArray;
  }

  addSplitWith(): void {
    const newSplitWithValue = this.expensesForm.get('newSplitWith')?.value;
    if (newSplitWithValue) {
      const splitWithArray = this.expensesForm.get('splitWith') as FormArray;
      splitWithArray.push(this.fb.control(newSplitWithValue));
      this.expensesForm.get('newSplitWith')?.reset();
    }
  }

  removeSplitWithControl(index: number): void {
    const splitWith = this.expensesForm.get('splitWith') as FormArray;
    splitWith.removeAt(index);
  }

  get categories() {
    return this.budgetService.getCategories();
  }

  get expensesControls() {
    return (this.budgetForm.get('expenses') as FormArray).controls;
  }

  getExpenses(): FormArray {
    return this.budgetForm.get('expenses') as FormArray;
  }

  addTrip() {
    const trip = this.fb.group({
      header: '',
      items: this.fb.array([])
    });
    this.tripList.push(trip);
  }

  removeTrip(index: number) {
    console.log('Removing trip at index:', index);
    const trips = this.getTripList();

    trips.removeAt(index);

  }

  addItem(i: number, type: 'place' | 'note') {
    const tripFormGroup = this.getTripList().at(i) as FormGroup;
    const items = tripFormGroup.get('items') as FormArray;

    console.log('Items before addition:', items.value);

    items.push(this.createTripContent(type));

    console.log('Items after addition:', items.value);

  }

  removeItem(tripIndex: number, itemIndex: number) {
    console.log('Removing item at tripIndex:', tripIndex, 'itemIndex:', itemIndex);
    const tripFormGroup = this.getTripList().at(tripIndex) as FormGroup;
    const items = tripFormGroup.get('items') as FormArray;
    items.removeAt(itemIndex);
  }

  addPlace(i: number) {
    console.log('Adding place at index:', i);
    this.addItem(i, 'place');
  }

  addNote(i: number) {
    console.log('Adding note at index:', i);
    this.addItem(i, 'note');
  }

  getItems(tripIndex: number): FormArray {
    const tripFormGroup = this.getTripList().at(tripIndex) as FormGroup;
    return tripFormGroup.get('items') as FormArray;
  }

  getTripList(): FormArray {
    return this.tripListForm.get('tripList') as FormArray;
  }

  get tripList(): FormArray {
    return this.tripListForm.get('tripList') as FormArray;
  }

  getPlaces(listIndex: number): FormArray {
    const list = this.tripList.at(listIndex) as FormGroup;
    return list.get('places') as FormArray;
  }

  getNotes(listIndex: number): FormArray {
    const list = this.tripList.at(listIndex) as FormGroup;
    return list.get('notes') as FormArray;
  }

  isNameOfPlaceEmpty(index: number): boolean {
    const place = this.tripListForm.get('places') as FormArray;
    const placeFormGroup = place.at(index) as FormGroup;
    return placeFormGroup.get('nameOfPlace')?.value?.trim() == '';
  }

  itineraryFormDatesControls() {
    return (this.itineraryForm.get('dates') as FormArray).controls;
  }

  getItineraryPlaces(dateIndex: number): FormArray {
    const dateFormGroup = this.itineraryFormDatesControls().at(dateIndex) as FormGroup;
    return dateFormGroup.get('places') as FormArray;
  }

  addDate(): void {
    const dates = this.itineraryForm.get('dates') as FormArray;
    dates.push(this.createItineraryDateForm());
  }

  addItineraryPlace(dateIndex: number): void {
    const dateForm = (this.itineraryForm.get('dates') as FormArray).at(dateIndex) as FormGroup;
    const places = dateForm.get('places') as FormArray;
    const newPlaceForm = this.fb.group({
      country: [''],  // Keep these blank or with placeholders
      latitude: [''],
      longitude: ['']
    });
    places.push(newPlaceForm);
  }

  removeDate(index: number): void {
    const dates = this.itineraryForm.get('dates') as FormArray;
    dates.removeAt(index);
  }

  removePlace(dateIndex: number, placeIndex: number): void {
    const dateForm = (this.itineraryForm.get('dates') as FormArray).at(dateIndex) as FormGroup;
    const places = dateForm.get('places') as FormArray;
    // const placeId = places.at(placeIndex).value.id;
    places.removeAt(placeIndex);
  }

  getDatesControls(): FormArray {
    return this.itineraryForm.get('dates') as FormArray;
  }

  ngOnInit(): void {
    const tripId = this.route.snapshot.params['tripId'];
    this.tripHeaderForm.patchValue({ tripId: tripId });
    console.log('oninit', this.isLoggedIn$)
    this.isLoggedIn$.pipe(
      takeUntil(this.destroy$),
      tap(isLoggedIn => {
        if (isLoggedIn) {
          this.loadFormData();

        } else {
          console.log('User is not logged in');
          this.tripHeader$.subscribe((tripHeader) => {
            if (tripHeader) {
              console.log(tripHeader)
              this.tripHeaderForm.patchValue(tripHeader);
            }
          });
        }
      })
    ).subscribe();

    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const element = document.querySelector('#' + fragment);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
    this.currencies = this.budgetService.getCurrencies();

    this.initAutoSave(this.tripHeaderForm, this.destroy$);
    this.initAutoSave(this.itineraryForm, this.destroy$);
    this.initAutoSave(this.tripListForm, this.destroy$);
    this.initAutoSave(this.budgetForm, this.destroy$);
  }

  loadFormData(): void {
    const tripId = this.tripHeaderForm.get('tripId')?.value;;
    console.log(tripId)
    if (tripId) {
      this.apiService.getTripHeaderByTripId(tripId).subscribe({
        next: (resp) => {
          this.tripHeaderForm.patchValue(resp);
          const zoom = 8;
          this.initMap(resp.latitude, resp.longitude, zoom);
          console.log(this.tripHeaderForm.value);
        },
        error: (error) => {
          console.error('Failed to load trip header data:', error);
        }
      });
    } else {
      console.log('No valid tripId provided');
    }
  }

  initAutoSave(form: FormGroup, destroy$: Observable<any>) {
    form.valueChanges.pipe(
      debounceTime(1000),
      switchMap(() => this.authService.isAuthenticated()),
      takeUntil(destroy$),
    ).subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.saveToState(form, form.value);
      }
    });
  }

  saveToState(form: FormGroup, formValue: any) {
    if (form === this.tripHeaderForm) {
      this.store.dispatch(new UpdateTripHeader(formValue));
    } else if (form === this.itineraryForm) {
      this.store.dispatch(new UpdateItinerary(formValue));
    } else if (form === this.tripListForm) {
      this.store.dispatch(new UpdateTripList(formValue));
    } else if (form === this.budgetForm) {
      this.store.dispatch(new UpdateBudget(formValue));
    }
  }

  initAutocomplete(dateIndex: number, placeIndex: number, inputElement: HTMLInputElement): void {
    if (!this.autocompleteInitialized.get(inputElement)) {
      const autocomplete = new google.maps.places.Autocomplete(inputElement, { types: ['geocode'] });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const destination: Destination = {
            country: place.name || "Unknown",
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          };
          this.updatePlaceInItinerary(destination, dateIndex, placeIndex);
          const zoom = 14;
          this.initMap(destination.latitude, destination.longitude, zoom);
        } else {
          console.error('Place has no geometry');
        }
      })
    };
    this.autocompleteInitialized.set(inputElement, true);
  }

  updatePlaceInItinerary(destination: Destination, dateIndex: number, placeIndex: number): void {
    const dateFormGroup = (this.itineraryForm.get('dates') as FormArray).at(dateIndex) as FormGroup;
    const placesArray = dateFormGroup.get('places') as FormArray;
    const placeFormGroup = placesArray.at(placeIndex) as FormGroup;

    placeFormGroup.patchValue(destination);
  }

  // private addDestinationToItineraryDate(destination: Destination, dateIndex: number): void {
  //   const dateFormGroup = (this.itineraryForm.get('dates') as FormArray).at(dateIndex) as FormGroup;
  //   const placesArray = dateFormGroup.get('places') as FormArray;
  //   const existingDestinationIndex = placesArray.controls.findIndex(
  //     (ctrl: AbstractControl) => ctrl.get('country')?.value === destination.country
  //   );

  //   if (existingDestinationIndex !== -1) {
  //     const existingFormGroup = placesArray.at(existingDestinationIndex) as FormGroup;
  //     existingFormGroup.patchValue({
  //       country: destination.country,
  //       latitude: destination.latitude,
  //       longitude: destination.longitude
  //     });
  //   } else {
  //     const destinationFormGroup = this.createPlaceForm(destination);
  //     placesArray.push(destinationFormGroup);
  //   }
  // }

  ngAfterViewInit(): void {

    // if (typeof google !== 'undefined') {
    //   const autocomplete = new google.maps.places.Autocomplete(this.autocompleteInput.nativeElement);

    //   autocomplete.addListener('place_changed', () => {
    //     const destinationControl = this.userPlansForm.get('nameOfPlace');
    //     if (destinationControl) {
    //       const place = autocomplete.getPlace();
    //       console.log(place);
    //       destinationControl.setValue(place.name);
    //     }
    //   });
    // } else {
    //   console.error('Google Maps JavaScript API not loaded');
    // }
    this.destinations$.subscribe(destinations => {
      if (destinations.length > 0) {
        const latestDestination = destinations[destinations.length - 1];
        const zoom = 9;
        this.initMap(latestDestination.latitude, latestDestination.longitude, zoom);
      }
    });
  }

  initMap(lat: number, lng: number, zoom: number): void {
    const mapProperties = {
      center: new google.maps.LatLng(lat, lng),
      zoom: zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    console.log(this.mapElement.nativeElement)
    new google.maps.Map(this.mapElement.nativeElement, mapProperties);
  }

  onSubmit(): void {
    this.openSignupDialog();
  }

  openSignupDialog(): void {
    const dialogRef = this.dialog.open(SignupDialogComponent, {
      width: '280px',
      height: '400px',
      data: {
        plans: this.plans,
        showSkipOption: false,
        showLoginOption: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result === 'signedUp') {
        this.isLoggedIn$;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}