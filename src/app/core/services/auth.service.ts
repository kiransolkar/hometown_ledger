import { Injectable, inject } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signInAnonymously, signOut, user, User as FirebaseUser, updateProfile } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router = inject(Router);
  private user$ = user(this.auth);

  constructor() {}

  getAuthState(): Observable<User | null> {
    return this.user$.pipe(
      map((firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          };
        }
        return null;
      })
    );
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      if (result.user) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async signInAsGuest(username: string): Promise<void> {
    try {
      // Sign in anonymously with Firebase
      const result = await signInAnonymously(this.auth);

      if (result.user) {
        // Update the user's display name with the provided username
        await updateProfile(result.user, {
          displayName: username
        });

        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Error signing in as guest:', error);
      throw error;
    }
  }

  async signOutUser(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    const firebaseUser = this.auth.currentUser;
    if (firebaseUser) {
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      };
    }
    return null;
  }
}
