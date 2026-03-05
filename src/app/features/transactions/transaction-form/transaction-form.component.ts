import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TransactionService } from '../../../core/services/transaction.service';
import { MemberService } from '../../../core/services/member.service';
import { Member } from '../../../shared/models/member.model';
import { calculateMeetingFine } from '../../../shared/models/transaction.model';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-transaction-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatAutocompleteModule
  ],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.css'
})
export class TransactionFormComponent implements OnInit {
  transactionForm!: FormGroup;
  isEditMode = false;
  members: Member[] = [];
  filteredMembers!: Observable<Member[]>;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private memberService: MemberService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<TransactionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.initializeForm();

    if (this.data) {
      this.isEditMode = true;
      this.patchFormValues();
      // Disable member selection in edit mode
      this.transactionForm.get('memberSearch')?.disable();
      this.transactionForm.get('memberId')?.disable();
    }

    // Watch for meetings attended changes to auto-calculate meeting fine
    this.transactionForm.get('meetingsAttended')?.valueChanges.subscribe(attended => {
      if (attended !== null && attended !== '') {
        this.calculateAndSetMeetingFine(attended);
      }
    });

    // Watch for fee changes to auto-calculate total and pending amounts
    this.transactionForm.get('annualFee')?.valueChanges.subscribe(() => this.calculateTotals());
    this.transactionForm.get('meetingFine')?.valueChanges.subscribe(() => this.calculateTotals());
    this.transactionForm.get('miscFine')?.valueChanges.subscribe(() => this.calculateTotals());
    this.transactionForm.get('amountPaid')?.valueChanges.subscribe(() => this.calculateTotals());
  }

  loadMembers(): void {
    this.memberService.getMembers().subscribe(members => {
      this.members = members;
    });
  }

  initializeForm(): void {
    this.transactionForm = this.fb.group({
      memberId: ['', Validators.required],
      memberSearch: [''],
      year: [this.currentYear, [Validators.required, Validators.min(2020), Validators.max(2050)]],
      annualFee: [600, [Validators.required, Validators.min(0)]],
      meetingFine: [{ value: 0, disabled: true }, [Validators.min(0)]],
      miscFine: [0, [Validators.min(0)]],
      amountPaid: [0, [Validators.required, Validators.min(0)]],
      totalAmount: [{ value: 600, disabled: true }],
      pendingAmount: [{ value: 600, disabled: true }],
      meetingsAttended: [4, [Validators.required, Validators.min(0), Validators.max(4)]],
      date: [new Date(), Validators.required],
      notes: ['']
    });

    // Setup autocomplete
    this.filteredMembers = this.transactionForm.get('memberSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterMembers(value || ''))
    );
  }

  private _filterMembers(value: string): Member[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.members.filter(member =>
      member.fullName.toLowerCase().includes(filterValue) ||
      member.emailAddress.toLowerCase().includes(filterValue)
    );
  }

  onMemberSelected(member: Member): void {
    this.transactionForm.patchValue({
      memberId: member.memberId,
      memberSearch: member.fullName
    });
  }

  displayMemberFn(memberId: number): string {
    if (!memberId) return '';
    const member = this.members.find(m => m.memberId === memberId);
    return member ? member.fullName : '';
  }

  patchFormValues(): void {
    this.transactionForm.patchValue({
      memberId: this.data.memberId,
      memberSearch: this.data.memberName,
      year: this.data.year,
      annualFee: this.data.annualFee,
      meetingFine: this.data.meetingFine,
      miscFine: this.data.miscFine,
      amountPaid: this.data.amountPaid,
      totalAmount: this.data.totalAmount,
      pendingAmount: this.data.pendingAmount,
      meetingsAttended: this.data.meetingsAttended !== undefined ? this.data.meetingsAttended : 4,
      date: new Date(this.data.date),
      notes: this.data.notes || ''
    });
  }

  calculateAndSetMeetingFine(meetingsAttended: number): void {
    if (meetingsAttended >= 0 && meetingsAttended <= 4) {
      const fineAmount = calculateMeetingFine(meetingsAttended);
      this.transactionForm.patchValue({
        meetingFine: fineAmount
      }, { emitEvent: false });

      // Trigger totals calculation after updating meeting fine
      this.calculateTotals();
    }
  }

  calculateTotals(): void {
    const annualFee = this.transactionForm.get('annualFee')?.value || 0;
    const meetingFine = this.transactionForm.get('meetingFine')?.value || 0;
    const miscFine = this.transactionForm.get('miscFine')?.value || 0;
    const amountPaid = this.transactionForm.get('amountPaid')?.value || 0;

    const totalAmount = annualFee + meetingFine + miscFine;
    const pendingAmount = totalAmount - amountPaid;

    this.transactionForm.patchValue({
      totalAmount: totalAmount,
      pendingAmount: pendingAmount
    }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.getRawValue(); // getRawValue() includes disabled fields

      // Remove memberSearch field as it's not part of the transaction model
      const transactionData = {
        memberId: formValue.memberId,
        year: formValue.year,
        annualFee: formValue.annualFee,
        meetingFine: formValue.meetingFine,
        miscFine: formValue.miscFine,
        amountPaid: formValue.amountPaid,
        meetingsAttended: formValue.meetingsAttended,
        date: formValue.date,
        notes: formValue.notes
      };

      if (this.isEditMode) {
        this.transactionService.updateTransaction(this.data.transactionId, transactionData);
        this.snackBar.open('Transaction updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      } else {
        this.transactionService.addTransaction(transactionData);
        this.snackBar.open('Transaction added successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }

      this.dialogRef.close(true);
    } else {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
