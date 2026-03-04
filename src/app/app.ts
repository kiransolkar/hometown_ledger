import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { MigrationService } from './core/services/migration.service';
import { User } from './shared/models/user.model';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

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
    MatMenuModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'Member Dashboard';
  isSidenavOpen = false;
  user$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private migrationService: MigrationService
  ) {
    this.user$ = this.authService.getAuthState();
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
}
