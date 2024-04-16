import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Budget, Destination, Itinerary, Trip, TripHeader, TripStateModel } from './model';

// Actions
export class AddDestination {
    static readonly type = '[Trip] Add Destination';
    constructor(public payload: Destination) { }
}
export class UpdateTripHeader {
    static readonly type = '[Trip] Update Trip Header';
    constructor(public payload: TripHeader) { }
}
export class CreateTrip {
    static readonly type = '[Trip] Create Trip';
    constructor(public payload: Trip) { }
}
export class UpdateTrip {
    static readonly type = '[Trip] Update Trip';
    constructor(public payload: Trip) { }
}
export class UpdateItinerary {
    static readonly type = '[Trip] Update Itinerary';
    constructor(public payload: Itinerary) { }
}
export class UpdateTripList {
    static readonly type = '[Trip] Update Trip List';
    constructor(public payload: Trip[]) { }
}
export class UpdateBudget {
    static readonly type = '[Trip] Update Budget';
    constructor(public payload: Budget) { }
}


// Initial State
@State<TripStateModel>({
    name: 'trip',
    defaults: {
        currentTrip: null,
        destinations: [],
        tripHeader: null,
        itinerary: null,
        tripList: [],
        budget: null
    }
})
@Injectable()
export class TripState {
    // Selectors
    @Selector()
    static currentTrip(state: TripStateModel): Trip | null {
        return state.currentTrip;
    }

    @Selector()
    static destinations(state: TripStateModel): Destination[] {
        return state.destinations;
    }

    @Selector()
    static tripHeader(state: TripStateModel): TripHeader | null {
        return state.tripHeader;
    }

    @Selector()
    static itinerary(state: TripStateModel): Itinerary | null {
        return state.itinerary;
    }

    @Selector()
    static tripList(state: TripStateModel): Trip[] {
        return state.tripList;
    }

    @Selector()
    static budget(state: TripStateModel): Budget | null {
        return state.budget;
    }

    @Action(AddDestination)
    addDestination({ getState, patchState }: StateContext<TripStateModel>, { payload }: AddDestination) {
        const state = getState();
        patchState({
            destinations: [...state.destinations, payload]
        });
    }

    @Action(CreateTrip)
    createTrip({ patchState }: StateContext<TripStateModel>, { payload }: CreateTrip) {
        patchState({
            currentTrip: payload
        });
    }

    @Action(UpdateTripHeader)
    updateTripHeader(ctx: StateContext<TripStateModel>, action: UpdateTripHeader) {
        ctx.patchState({
            tripHeader: action.payload
        });
    }

    @Action(UpdateItinerary)
    updateItinerary({ patchState }: StateContext<TripStateModel>, { payload }: UpdateItinerary) {
        patchState({ itinerary: payload });
    }

    // @Action(UpdateTrip)
    // updateTrip({ getState, patchState }: StateContext<TripStateModel>, { payload }: UpdateTrip) {
    //     const state = getState();
    //     patchState({
    //         currentTrip: { ...state.currentTrip, ...payload }
    //     });
    //     console.log('Updated State:', getState());
    // }

    @Action(UpdateTripList)
    updateTripList({ getState, patchState }: StateContext<TripStateModel>, { payload }: UpdateTripList) {
        patchState({ tripList: payload });
        console.log('Updated State:', getState());
    }

    @Action(UpdateBudget)
    updateBudget({ patchState }: StateContext<TripStateModel>, { payload }: UpdateBudget) {
        patchState({ budget: payload });
    }
}
