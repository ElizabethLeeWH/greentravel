import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

// function validateStartDate(startDate: Date): { [key: string]: any } | null {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     if (startDate < today) {
//         return { 'startDateInvalid': true };
//     }
//     return null;
// }

// export function startDateValidator(): ValidatorFn {
//     return (control: AbstractControl): { [key: string]: any } | null => {
//         console.log('Control State:', control);
//         if (!control.value) return null; // handle cases where value is null or undefined
//         const startDate = new Date(control.value);
//         return validateStartDate(startDate);
//     };
// }

// export function startDateValidator(): ValidatorFn {
//     return (control: AbstractControl): ValidationErrors | null => {
//         console.log('Control State:', control);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const startDate = new Date(control.value);
//         console.log('Validating:', startDate, 'against:', today);

//         if (startDate < today) {
//             console.log('Date is invalid');
//             return { 'startDateInvalid': true };
//         }
//         return null;
//     };
// }

export function startDateValidator(group: AbstractControl): { [key: string]: any } | null {
    const startDate = group.get('startDate')?.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset today's time for proper comparison

    // if (startDate < today) {
    //     return { 'startDateNotValid': true };
    // }

    if (new Date(startDate) < today) {
        return { 'startDateInvalid': true };
    }

    return null; // No error
}

export function dateRangeValidator(group: AbstractControl): { [key: string]: any } | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // if (startDate < today && startDate > endDate) {
    //     return { 'dateRangeInvalid': true };
    // }

    if (new Date(endDate) <= new Date(startDate)) {
        return { 'dateRangeInvalid': true };
    }
    return null;
}

