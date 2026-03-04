import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdminConfig } from '../../../shared/models/admin-config.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-config',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent implements OnInit {
  adminConfig?: AdminConfig;
  adminEmails: string[] = [];
  newEmail = '';
  currentUserEmail = '';
  protected readonly protectedEmails = ['kiransolkar@gmail.com', 'kiransolkar.new@gmail.com'];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserEmail = currentUser?.email || '';

    this.loadConfig();
  }

  loadConfig(): void {
    this.adminService.getAdminConfig().subscribe(config => {
      this.adminConfig = config;
      this.adminEmails = [...config.adminEmails];
    });
  }

  addEmail(): void {
    const email = this.newEmail.trim().toLowerCase();

    if (!email) {
      this.snackBar.open('Please enter an email address', 'Close', {
        duration: 3000
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.snackBar.open('Please enter a valid email address', 'Close', {
        duration: 3000
      });
      return;
    }

    if (this.adminEmails.includes(email)) {
      this.snackBar.open('This email is already in the admin list', 'Close', {
        duration: 3000
      });
      return;
    }

    this.adminEmails.push(email);
    this.newEmail = '';
    this.snackBar.open('Email added. Click Save to confirm changes.', 'Close', {
      duration: 3000
    });
  }

  removeEmail(email: string): void {
    if (this.isProtectedEmail(email)) {
      this.snackBar.open('Cannot remove protected admin email', 'Close', {
        duration: 3000
      });
      return;
    }

    if (this.adminEmails.length <= 1) {
      this.snackBar.open('Cannot remove the last admin email', 'Close', {
        duration: 3000
      });
      return;
    }

    if (email === this.currentUserEmail) {
      if (!confirm('You are removing yourself as an admin. You will lose access to admin features. Are you sure?')) {
        return;
      }
    }

    const index = this.adminEmails.indexOf(email);
    if (index > -1) {
      this.adminEmails.splice(index, 1);
      this.snackBar.open('Email removed. Click Save to confirm changes.', 'Close', {
        duration: 3000
      });
    }
  }

  async saveChanges(): Promise<void> {
    if (this.adminEmails.length === 0) {
      this.snackBar.open('There must be at least one admin email', 'Close', {
        duration: 3000
      });
      return;
    }

    try {
      await this.adminService.updateAdminEmails(this.adminEmails, this.currentUserEmail);
      this.snackBar.open('Admin configuration updated successfully!', 'Close', {
        duration: 3000
      });
      this.loadConfig();
    } catch (error) {
      console.error('Error saving config:', error);
      this.snackBar.open('Error saving configuration. Please try again.', 'Close', {
        duration: 3000
      });
    }
  }

  cancelChanges(): void {
    this.loadConfig();
    this.newEmail = '';
    this.snackBar.open('Changes cancelled', 'Close', {
      duration: 2000
    });
  }

  hasChanges(): boolean {
    if (!this.adminConfig) return false;

    if (this.adminEmails.length !== this.adminConfig.adminEmails.length) {
      return true;
    }

    return !this.adminEmails.every(email => this.adminConfig!.adminEmails.includes(email));
  }

  isProtectedEmail(email: string): boolean {
    return this.protectedEmails.includes(email.toLowerCase());
  }
}
