import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from './core/services/auth.service';
import { MigrationService } from './core/services/migration.service';
import { LanguageService, Language } from './core/services/language.service';
import { AdminService } from './core/services/admin.service';
import { User } from './shared/models/user.model';
import { Observable } from 'rxjs';
import { filter, take, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule,
    TranslateModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'साई समर्थ सेवा मंडळ';
  isSidenavOpen = false;
  user$: Observable<User | null>;
  availableLanguages: Language[];
  currentLanguage$: Observable<string>;
  isAdmin$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private migrationService: MigrationService,
    private languageService: LanguageService,
    private adminService: AdminService
  ) {
    this.user$ = this.authService.getAuthState();
    this.availableLanguages = this.languageService.availableLanguages;
    this.currentLanguage$ = this.languageService.currentLanguage$;

    // Check if current user is admin
    this.isAdmin$ = this.user$.pipe(
      switchMap(user => this.adminService.isAdmin(user?.email || null))
    );
  }

  ngOnInit(): void {
    // Trigger data migration when user logs in
    this.user$.pipe(
      filter(user => user !== null),
      take(1)
    ).subscribe(async () => {
      await this.migrationService.migrateData();
    });
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  async signOut(): Promise<void> {
    await this.authService.signOutUser();
  }

  changeLanguage(languageCode: string): void {
    this.languageService.setLanguage(languageCode);
  }

  getCurrentLanguageName(): string {
    const currentLang = this.languageService.getCurrentLanguageObject();
    return currentLang ? currentLang.nativeName : 'English';
  }
}
