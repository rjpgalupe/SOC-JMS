import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent {
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  isDropdownOpen = false;
  isReviewer: boolean = false;
  isAuthor: boolean = false;
  user: any;
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  notifications: any[] = [];
  unreadNotifications: any[] = [];
  showNotifDropdown: boolean = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}
  
  ngOnInit(): void {
    // Retrieve user role from session storage
    const userRole = sessionStorage.getItem('userRole');
    // Check if the user is an admin or superadmin
    this.isAdmin = userRole === 'admin';
    this.isSuperAdmin = userRole === 'superadmin';
    this.isAuthor = userRole === 'author';
    this.isReviewer = userRole === 'reviewer';

    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.userService.getUserById(userId).subscribe(
        (user: any) => {
          this.user = user;
        },
        (error: any) => {
          console.error('Error fetching user:', error);
        }
      );
      
      // Fetch unread notifications for the current user
      this.http.get<any[]>(`https://jmshau.site/notifications/${userId}`).subscribe(
        (data) => {
            this.notifications = data; // Store all notifications
            this.unreadNotifications = data.filter(notification => notification.status === 'unread'); // Filter unread notifications
        },
        (error) => {
            console.error(error);
            // Hadle error
        }
      );
    }
  }

  changePassword() {
    if (this.newPassword !== this.confirmNewPassword) {
      this.snackBar.open('New password and confirm new password must match', 'Close', { duration: 3000, verticalPosition: 'top' });
      return;
    }

    const userId = sessionStorage.getItem('userId'); // Get the user's ID from sessionStorage
    if (!userId) {
      console.error('User ID not found in sessionStorage');
      return;
    }
    
    // Call the changePassword method with the correct number of arguments
    this.userService.changePassword(userId, this.currentPassword, this.newPassword)
      .subscribe(
        () => {
          // Password change successful
          this.snackBar.open('Password changed successfully', 'Close', { duration: 3000, verticalPosition: 'top' });
          // Reset form fields
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
        },
        error => {
          // Password change failed
          console.error('Password changed error:', error);
          this.snackBar.open('Failed to change password. Please try again later.', 'Close', { duration: 3000, verticalPosition: 'top' });
        }
      );
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

  markNotificationAsRead(notification: any) {
    // Update the notification as read in the backend
    const notificationId = notification._id;
    this.http.put(`https://jmshau.site/notifications/${notificationId}/mark-as-read`, {}).subscribe(
        (response) => {
            console.log('Notification marked as read:', response);
            // Update the read status of the notification locally
            notification.Status = 'read';
            // Remove the notification from the unreadNotifications array
            this.unreadNotifications = this.unreadNotifications.filter(n => n._id !== notificationId);
        },
        (error) => {
            console.error('Error marking notification as read:', error);
        }
    );
  }

  logout() {
    this.authService.setIsUserLogged(false);
    this.authService.clearUserId();
    this.router.navigate(['login'])
    } 

    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
      this.showNotifDropdown = false;
    }
  
    toggleNotifDropdown() {
      this.showNotifDropdown = !this.showNotifDropdown;
      this.isDropdownOpen = false;
    }

    viewJournal(journalId: string) {
      this.router.navigate(['/reviewer/view-journal', journalId]);
    }
}
