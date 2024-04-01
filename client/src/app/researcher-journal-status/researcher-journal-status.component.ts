import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { JournalService } from '../journal.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-researcher-journal-status',
  templateUrl: './researcher-journal-status.component.html',
  styleUrls: ['./researcher-journal-status.component.css']
})
export class ResearcherJournalStatusComponent {
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
              private http: HttpClient, 
              private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    const userId = sessionStorage.getItem('userId'); // Get the current user's ID from local storage
    if (userId) { // Check if userId is not null
      this.journalService.getJournalsByUser(userId).subscribe(
        (data) => {
          this.journals = data.map((journal, index) => ({ ...journal, id: index + 1 }));
          this.filteredJournals = [...this.journals];
        },
        (error) => {
          console.error(error);
          // Handle error
        }
      );
    } else {
      console.error('User ID not found in local storage');
      // Handle case where user ID is not found
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

  viewJournal(journalId: string): void {
    this.router.navigate(['/researcher/view-journal', journalId]);
  }


  logout() {
    this.snackBar.open('Logout successful.', 'Close', { duration: 3000, verticalPosition: 'top'});
    this.authService.setIsUserLogged(false);
    this.authService.clearUserId();
    this.router.navigate(['login'])
    } 

    toggleNotifDropdown(){
      this.showNotifDropdown = !this.showNotifDropdown;
      this.isDropdownOpen = false;
    }
  
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    }

}
