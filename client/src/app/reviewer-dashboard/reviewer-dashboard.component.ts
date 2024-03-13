import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reviewer-dashboard',
  templateUrl: './reviewer-dashboard.component.html',
  styleUrls: ['./reviewer-dashboard.component.css']
})
export class ReviewerDashboardComponent implements OnInit {
  notifications: any[] = [];
  unreadNotifications: any[] = [];
  showNotifDropdown: boolean = false;
  isDropdownOpen = false;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}
  ngOnInit(): void {
    // Fetch unread notifications for the current user
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.http.get<any[]>(`https://jms-backend-testing.vercel.app/notifications/${userId}`).subscribe(
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

viewJournal(journalId: string) {
  this.router.navigate(['/reviewer/view-journal', journalId]);
}

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


  toggleDropdown(){
    this.isDropdownOpen = !this.isDropdownOpen;
    this.showNotifDropdown = false;
  }

  toggleNotifDropdown(){
    this.showNotifDropdown = !this.showNotifDropdown;
    this.isDropdownOpen = false;
  }

  logout() {
    this.authService.setIsUserLogged(false);
    this.authService.clearUserId();
    this.router.navigate(['login'])
  } 
  
}
