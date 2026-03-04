import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  Timestamp
} from '@angular/fire/firestore';
import { AdminConfig } from '../../shared/models/admin-config.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private firestore: Firestore = inject(Firestore);
  private adminConfigCollection = collection(this.firestore, 'adminConfig');
  private configDocId = 'main'; // Single document for admin config
  private migrationKey = 'admin_config_migrated';

  // Initial admin emails - hardcoded for initial setup
  private readonly INITIAL_ADMIN_EMAILS = [
    'kiransolkar@gmail.com',
    'kiransolkar.new@gmail.com'
  ];

  constructor() {
    this.checkAndInitialize();
  }

  private async checkAndInitialize(): Promise<void> {
    const migrated = localStorage.getItem(this.migrationKey);
    if (!migrated) {
      await this.initializeAdminConfig();
      localStorage.setItem(this.migrationKey, 'true');
    }
  }

  async initializeAdminConfig(): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'adminConfig', this.configDocId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log('Initializing admin configuration...');
        const initialConfig = {
          adminEmails: this.INITIAL_ADMIN_EMAILS,
          lastUpdated: Timestamp.now(),
          updatedBy: 'system'
        };

        await setDoc(docRef, initialConfig);
        console.log('Admin configuration initialized!');
      }
    } catch (error) {
      console.error('Error initializing admin config:', error);
    }
  }

  getAdminConfig(): Observable<AdminConfig> {
    return new Observable<AdminConfig>(subscriber => {
      const docRef = doc(this.firestore, 'adminConfig', this.configDocId);
      getDoc(docRef)
        .then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const config: AdminConfig = {
              adminEmails: data['adminEmails'] || [],
              lastUpdated: data['lastUpdated']?.toDate() || new Date(),
              updatedBy: data['updatedBy'] || 'unknown'
            };
            subscriber.next(config);
          } else {
            // Return initial config if document doesn't exist
            subscriber.next({
              adminEmails: this.INITIAL_ADMIN_EMAILS,
              lastUpdated: new Date(),
              updatedBy: 'system'
            });
          }
          subscriber.complete();
        })
        .catch(error => {
          console.error('Error fetching admin config:', error);
          subscriber.next({
            adminEmails: this.INITIAL_ADMIN_EMAILS,
            lastUpdated: new Date(),
            updatedBy: 'system'
          });
          subscriber.complete();
        });
    });
  }

  async updateAdminEmails(emails: string[], updatedBy: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'adminConfig', this.configDocId);
      await updateDoc(docRef, {
        adminEmails: emails,
        lastUpdated: Timestamp.now(),
        updatedBy: updatedBy
      });
      console.log('Admin emails updated successfully');
    } catch (error) {
      console.error('Error updating admin emails:', error);
      throw error;
    }
  }

  isAdmin(email: string | null): Observable<boolean> {
    if (!email) {
      return of(false);
    }

    return this.getAdminConfig().pipe(
      map(config => {
        const isAdmin = config.adminEmails.includes(email.toLowerCase());
        return isAdmin;
      })
    );
  }

  // Helper method to check if current user is admin synchronously (for guards)
  async isAdminSync(email: string | null): Promise<boolean> {
    if (!email) {
      return false;
    }

    try {
      const docRef = doc(this.firestore, 'adminConfig', this.configDocId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const adminEmails: string[] = data['adminEmails'] || [];
        return adminEmails.includes(email.toLowerCase());
      }

      return this.INITIAL_ADMIN_EMAILS.includes(email.toLowerCase());
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}
