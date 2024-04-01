import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { JournalService } from '../journal.service';
import { UserService } from '../user.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reviewer-assigned-journal',
  templateUrl: './reviewer-assigned-journal.component.html',
  styleUrls: ['./reviewer-assigned-journal.component.css']
})
export class ReviewerAssignedJournalComponent {
  notifications: any[] = [];
  unreadNotifications: any[] = [];
  showNotifDropdown: boolean = false;
  isDropdownOpen = false;
  journals: any[] = [];
  filteredJournals: any[] = [];
  searchQuery: string = '';

  constructor(private authService: AuthService,
              private router: Router, 
              private journalService: JournalService, 
              private userService: UserService, 
              private http: HttpClient,
              private snackBar: MatSnackBar) {}
  
  ngOnInit(): void {
    // Get the user ID from localStorage
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      // Fetch assigned journals for the current reviewer
      this.journalService.getAssignedJournals(userId).subscribe(
        (data) => {
          this.journals = data.map((journal, index) => ({ ...journal, id: index + 1 }));
          this.filteredJournals = [...this.journals];
        },
        (error) => {
          console.error(error);
          // Handle error
        }
      );
      
       // Fetch unread notifications for the current user
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
    } else {
      // Handle missing user ID
      console.error('User ID not found in localStorage');
    }
  }

  filterJournals() {
    if (!this.searchQuery.trim()) {
      this.filteredJournals = [...this.journals];
    } else {
      const searchTerm = this.searchQuery.toLowerCase().trim();
      this.filteredJournals = this.journals.filter(journal => {
        // Check if the fields are defined before calling toLowerCase()
        const id = journal.id ? journal.id.toString().toLowerCase() : '';
        const title = journal.journalTitle ? journal.journalTitle.toLowerCase() : '';
        const author = journal.author ? journal.author.toLowerCase() : '';
        const status = journal.status ? journal.status.toLowerCase() : '';
  
        // Filter the journals based on any of the fields containing the searchTerm
        return id.includes(searchTerm) ||
               title.includes(searchTerm) ||
               author.includes(searchTerm) ||
               status.includes(searchTerm);
      });
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

  viewJournal(journalId: string) {
    this.router.navigate(['/reviewer/view-journal', journalId]);
  }

  logout() {
    this.snackBar.open('Logout successful.', 'Close', { duration: 3000, verticalPosition: 'top'});
    this.authService.setIsUserLogged(false);
    this.authService.clearUserId();
    this.router.navigate(['login'])
  } 
  
}
