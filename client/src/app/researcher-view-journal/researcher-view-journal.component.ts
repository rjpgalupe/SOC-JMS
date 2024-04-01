import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { JournalService } from '../journal.service';
import { HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-researcher-view-journal',
  templateUrl: './researcher-view-journal.component.html',
  styleUrls: ['./researcher-view-journal.component.css']
})
export class ResearcherViewJournalComponent implements OnInit{
  notifications: any[] = [];
  unreadNotifications: any[] = [];
  showNotifDropdown: boolean = false;
  isDropdownOpen = false;
  journalId: string = '';
  journalTitle: string = '';
  consolidatedFeedback: string = '';

  constructor (private router: Router, 
              private authService: AuthService, 
              private route: ActivatedRoute, 
              private journalService: JournalService,
              private http: HttpClient,
              private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.journalId = params.get('journalId') || '';
      if (this.journalId) {
        this.getConsolidatedFeedback();
      }
    });
  }

  getConsolidatedFeedback(): void {
    this.journalService.getConsolidatedFeedback(this.journalId)
      .subscribe(
        (data) => {
          // Assuming the response contains consolidated feedback
          this.consolidatedFeedback = data.consolidatedFeedback;
          this.journalTitle = data.journalTitle;
        },
        (error) => {
          console.error(error);
          // Handle error scenario
        }
      );
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
