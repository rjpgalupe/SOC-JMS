import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-researcher-dashboard',
  templateUrl: './researcher-dashboard.component.html',
  styleUrls: ['./researcher-dashboard.component.css']
})
export class ResearcherDashboardComponent {
  notifications: any[] = [];
  unreadNotifications: any[] = [];
  showNotifDropdown: boolean = false;
  isDropdownOpen = false;

  constructor(private authService: AuthService, 
              private router: Router, 
              private http: HttpClient,
              private snackBar: MatSnackBar) {}

  markNotificationAsRead(notification: any) {
    // Update the notification as read in the backend
    const notificationId = notification._id;
    this.http.put(`https://jms-backend-testing.vercel.app/notifications/${notificationId}/mark-as-read`, {}).subscribe(
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
      }
    }

    viewJournal(journalId: string): void {
      this.router.navigate(['/researcher/view-journal', journalId]);
    }

    logout() {
      this.snackBar.open('Logout successful.', 'Close', { duration: 3000, verticalPosition: 'top'});
      this.authService.setIsUserLogged(false);
      this.authService.clearUserId();
      this.router.navigate(['publication'])
    } 

    toggleNotifDropdown(){
      this.showNotifDropdown = !this.showNotifDropdown;
      this.isDropdownOpen = false;
    }

    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    }

}
