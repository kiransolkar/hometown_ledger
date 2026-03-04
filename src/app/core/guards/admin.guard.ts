import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { AdminService } from '../services/admin.service';

export const adminGuard: CanActivateFn = async () => {
  const auth: Auth = inject(Auth);
  const router = inject(Router);
  const adminService = inject(AdminService);

  const user = auth.currentUser;

  if (!user || !user.email) {
    console.log('Admin Guard: No user logged in');
    router.navigate(['/login']);
    return false;
  }

  const isAdmin = await adminService.isAdminSync(user.email);

  if (isAdmin) {
    return true;
  } else {
    console.log('Admin Guard: User is not an admin');
    router.navigate(['/dashboard']);
    return false;
  }
};
