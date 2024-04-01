import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { JournalService } from '../journal.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-review-management',
  templateUrl: './reviewer-management.component.html',
  styleUrls: ['./reviewer-management.component.css']
})
export class ReviewerManagementComponent {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchQuery: string = '';
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  unreadNotifications: any[] = [];
  showNotifDropdown: boolean = false;
  isDropdownOpen = false;

  constructor(private authService: AuthService, 
              private router: Router, 
              private userService: UserService, 
              private journalService: JournalService,
              private snackBar: MatSnackBar ) {}


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

  this.loadUsers();
}

// Method to load assigned journals for each reviewer
loadAssignedJournals(): void {
  this.users.forEach(user => {
    this.journalService.getAssignedJournals(user._id).subscribe(
      (assignedJournals: any[]) => {
        if (assignedJournals.length > 0) {
          // Map assigned journals to their titles
          user.assignedJournals = assignedJournals.map(journal => journal.journalTitle);
          user.status = 'Assigned'; // Set the status accordingly
        } else {
          user.assignedJournals = []; // Set empty array if no journals assigned
          user.status = 'Not Assigned'; // Set the status accordingly
        }
      },
      (error) => {
        console.error(error);
        // Handle error
      }
    );
  });
}

  editUser(user: any) {
    // Implement edit functionality
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe(
        () => {
          // Reload users after successful deletion
          this.loadUsers();
          this.snackBar.open('Delete Success', 'Close', { duration: 3000, verticalPosition: 'top'});
        },
        (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Delete Failed!', 'Close', { duration: 3000, verticalPosition: 'top'});
          // Handle error
        }
      );
    }
  }
  
  loadUsers() {
    this.userService.getRoles('reviewer').subscribe(
      (data) => {
        this.users = data.map((user, index) => ({
          ...user,
          id: index + 1,
          assignedJournal: null // Initialize assignedJournal property
        }));
        this.loadAssignedJournals(); // Load assigned journals for each reviewer
        this.filteredUsers = [...this.users];
      },
      (error) => {
        console.error(error);
        // Handle error
      }
    );
  }
  
  filterUsers() {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const searchTerm = this.searchQuery.toLowerCase().trim();
      this.filteredUsers = this.users.filter(user => {
        const id = user.id ? user.id.toString().toLowerCase() : '';
        const firstName = user.firstName ? user.firstName.toLowerCase() : '';
        const lastName = user.lastName ? user.lastName.toLowerCase() : '';
        const email = user.email ? user.email.toLowerCase() : '';
        const role = user.role ? user.role.toLowerCase() : '';
        const status = user.status ? user.status.toLowerCase() : '';
  
        return id.includes(searchTerm) ||
              firstName.includes(searchTerm) ||
              lastName.includes(searchTerm) ||
              email.includes(searchTerm) ||
              role.includes(searchTerm) ||
              status.includes(searchTerm);
      });
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
