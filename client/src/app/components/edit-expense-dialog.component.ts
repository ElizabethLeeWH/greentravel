import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BudgetService } from '../budget.service';
import { Currency, Expense } from '../model';

@Component({
  selector: 'app-edit-expense-dialog',
  templateUrl: './edit-expense-dialog.component.html',
  styleUrl: './edit-expense-dialog.component.css'
})
export class EditExpenseDialogComponent implements OnInit {
  editForm: FormGroup;
  currencies!: Currency[];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditExpenseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private budgetService: BudgetService
  ) {
    const expense = this.data.expense as FormGroup;

    this.editForm = this.fb.group({
      currency: [expense.get('currency')?.value || '', Validators.required],
      amount: [expense.get('amount')?.value || '', Validators.required],
      category: [expense.get('category')?.value || '', Validators.required],
      date: [expense.get('date')?.value || null],
      paidBy: [expense.get('paidBy')?.value || ''],
      splitWith: this.fb.array([]),
      newSplitWith: ''
    });
  
    // Populate the splitWith form array
    const splitWithArray = expense.get('splitWith') as FormArray;
    if (splitWithArray) {
      splitWithArray.controls.forEach(control => {
        (this.editForm.get('splitWith') as FormArray).push(
          this.fb.control(control.value)
        );
      });
    }
    this.currencies = this.budgetService.getCurrencies();
    console.log('Form initialized with values:', this.editForm.value);
  }

  ngOnInit(): void {
    console.log('OnInit',this.data.expense);
  }

  populateSplitWith(splitWithData: string[]): void {
    const splitWithArray = this.editForm.get('splitWith') as FormArray;
    splitWithArray.clear();
    splitWithData.forEach(entry => splitWithArray.push(this.fb.control(entry)));
  }

  getSplitWithControls(): AbstractControl[] {
    return (this.editForm.get('splitWith') as FormArray).controls;
  }

  addSplitWith(): void {
    const newSplitWithValue = this.editForm.get('newSplitWith')?.value;
    if (newSplitWithValue) {
      const splitWithArray = this.editForm.get('splitWith') as FormArray;
      splitWithArray.push(this.fb.control(newSplitWithValue));
      this.editForm.get('newSplitWith')?.reset();
    }
  }

  removeSplitWithControl(index: number): void {
    const splitWithArray = this.editForm.get('splitWith') as FormArray;
    splitWithArray.removeAt(index);
  }

  save(): void {
    this.dialogRef.close(this.editForm.value);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  get categories() {
    return this.budgetService.getCategories();
  }

}