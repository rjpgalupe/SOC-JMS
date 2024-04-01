import { Component,HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../user.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  unreadNotifications: any[] = [];
  showNotifDropdown: boolean = false;
  isDropdownOpen = false;

  constructor(private authService: AuthService, 
              private router: Router, 
              private snackBar: MatSnackBar,) {}
  
  ngOnInit(): void {
    // Retrieve user role from session storage
    const userRole = sessionStorage.getItem('userRole');
    // Check if the user is an admin or superadmin
    this.isAdmin = userRole === 'admin';
    this.isSuperAdmin = userRole === 'superadmin';
  }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Check if the click is inside the dropdown toggle button
    if (target.matches('.dropdown-toggle')) {
      this.toggleDropdown(); // Toggle the dropdown
    } else {
      // Check if the click is outside the dropdown
      const dropdownContainer = target.closest('.dropdown');
      if (!dropdownContainer && this.isDropdownOpen) {
        this.isDropdownOpen = false;
      }
      const notifDropdown = target.closest('.dropdown');
      if (!notifDropdown && this.showNotifDropdown) {
        this.showNotifDropdown = false;
      }
    }
  }

  logout() {
    this.snackBar.open('Logout successful.', 'Close', { duration: 3000, verticalPosition: 'top'});
    this.authService.setIsUserLogged(false);
    this.authService.clearUserId();
    this.router.navigate(['login'])
  } 

  toggleDropdown(){
    this.isDropdownOpen = !this.isDropdownOpen;
    this.showNotifDropdown = false;
  }

  toggleNotifDropdown(){
    this.showNotifDropdown = !this.showNotifDropdown;
    this.isDropdownOpen = false;
  }
  
}
