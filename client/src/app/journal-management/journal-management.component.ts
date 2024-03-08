import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { JournalService } from '../journal.service';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-journal-management',
  templateUrl: './journal-management.component.html',
  styleUrls: ['./journal-management.component.css']
})
export class JournalManagementComponent {
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  journals: any[] = [];
  filteredJournals: any[] = [];
  searchQuery: string = '';
  unreadNotifications: any[] = [];
  showNotifDropdown: boolean = false;
  isDropdownOpen = false;

  constructor(private authService: AuthService, 
              private router: Router, 
              private journalService: JournalService, 
              private userService: UserService,
              private snackBar: MatSnackBar) {}

              
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.showNotifDropdown = false;
  }

  toggleNotifDropdown() {
    this.showNotifDropdown = !this.showNotifDropdown;
    this.isDropdownOpen = false;
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

ngOnInit(): void {
  // Retrieve user role from session storage
  const userRole = sessionStorage.getItem('userRole');
  // Check if the user is an admin or superadmin
  this.isAdmin = userRole === 'admin';
  this.isSuperAdmin = userRole === 'superadmin';
  this.loadJournals();
}

loadReviewers(): void {
  const reviewerIds = this.journals.flatMap(journal => journal.reviewers);
  this.userService.getReviewersByIds(reviewerIds).subscribe(
    (reviewers: any[]) => {
      this.journals.forEach(journal => {
        journal.reviewerNames = reviewers
          .filter(reviewer => journal.reviewers.includes(reviewer._id))
          .map(reviewer => `${reviewer.firstName} ${reviewer.lastName}`);
      });
    },
    (error) => {
      console.error(error);
      // Handle error
    }
  );
}
editJournal(journal: any) {
  
}

deleteJournal(journalId: string) {
  if (confirm("Are you sure you want to delete this journal?")) {
    this.journalService.deleteJournal(journalId).subscribe(
      () => {
        // Remove the deleted journal from the local array
        this.loadJournals();
        this.snackBar.open('Delete Success', 'Close', { duration: 3000, verticalPosition: 'top'});
      },  
      (error) => {
        console.error("Error deleting journal:", error);
        this.snackBar.open('Delete failed!', 'Close', { duration: 3000, verticalPosition: 'top'});
        // Handle error
      }
    );
  }
}

loadJournals () {
  this.journalService.getJournals().subscribe(
    (data) => {
      this.journals = data.map((journal, index) => ({ ...journal, id: index + 1 }));
      this.loadReviewers(); // Call the method to load reviewer names
      this.filteredJournals = [...this.journals];
    },
    (error) => {
      console.error(error);
      this.snackBar.open('Assign failed!', 'Close', { duration: 3000, verticalPosition: 'top'});
      // Handle error
    }
  );
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
  
  assignReviewer(journal: any) {
    this.router.navigate(['/admin/review-management/assign-reviewer', journal._id, journal.journalTitle]);
  }

  viewConsolidatedFeedback(journalId: string) {
    // Navigate to the consolidated feedback page with the journalId
    this.router.navigate(['/admin/consolidation-feedback', journalId]);
  }
  
  
  
  logout() {
    this.authService.setIsUserLogged(false);
    this.router.navigate(['login'])
  } 
}
