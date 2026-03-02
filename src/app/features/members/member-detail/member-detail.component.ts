import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MemberService } from '../../../core/services/member.service';
import { Member } from '../../../shared/models/member.model';

@Component({
  selector: 'app-member-detail',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css'
})
export class MemberDetailComponent implements OnInit {
  memberForm!: FormGroup;
  isEditMode = false;
  isNewMember = false;
  memberId?: number;
  member?: Member;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    const id = this.route.snapshot.paramMap.get('id');

    if (id === 'new') {
      this.isNewMember = true;
      this.isEditMode = true;
    } else if (id) {
      this.memberId = parseInt(id, 10);
      this.loadMember();
    }
  }

  initializeForm(): void {
    this.memberForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      surnameGroup: [''],
      dateOfBirth: ['', Validators.required],
      address: ['', Validators.required],
      community: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      emailAddress: ['', [Validators.required, Validators.email]]
    });

    if (!this.isEditMode) {
      this.memberForm.disable();
    }
  }

  loadMember(): void {
    if (this.memberId) {
      this.memberService.getMemberById(this.memberId).subscribe(member => {
        if (member) {
          this.member = member;
          this.memberForm.patchValue({
            firstName: member.firstName,
            middleName: member.middleName || '',
            lastName: member.lastName,
            surnameGroup: member.surnameGroup || '',
            dateOfBirth: member.dateOfBirth,
            address: member.address,
            community: member.community,
            phoneNumber: member.phoneNumber,
            emailAddress: member.emailAddress
          });
        }
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode) {
      this.memberForm.enable();
    } else {
      this.memberForm.disable();
      this.loadMember(); // Reset form to original values
    }
  }

  onSubmit(): void {
    if (this.memberForm.valid) {
      const formValue = this.memberForm.value;

      if (this.isNewMember) {
        this.memberService.addMember(formValue);
        this.snackBar.open('Member added successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.router.navigate(['/members']);
      } else if (this.memberId) {
        this.memberService.updateMember(this.memberId, formValue);
        this.snackBar.open('Member updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.isEditMode = false;
        this.memberForm.disable();
        this.loadMember();
      }
    } else {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/members']);
  }

  deleteMember(): void {
    if (this.memberId && confirm('Are you sure you want to delete this member?')) {
      this.memberService.deleteMember(this.memberId);
      this.snackBar.open('Member deleted successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.router.navigate(['/members']);
    }
  }
}
