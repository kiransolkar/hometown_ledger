import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  errorMessage: string = '';
  isLoading: boolean = false;
  guestUsername: string = '';

  constructor(private authService: AuthService) {}

  async signInWithGoogle(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.authService.signInWithGoogle();
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to sign in. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async signInAsGuest(): Promise<void> {
    if (!this.guestUsername || this.guestUsername.trim().length === 0) {
      this.errorMessage = 'Please enter a username to continue as guest.';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.authService.signInAsGuest(this.guestUsername.trim());
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to sign in as guest. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
