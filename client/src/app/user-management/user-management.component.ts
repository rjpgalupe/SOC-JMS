import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchQuery: string = '';
  unreadNotifications: any[] = [];
  showNotifDropdown: boolean = false;
  isDropdownOpen = false;
  isSuperAdmin: boolean = false;
  isAdmin: boolean = false;

  constructor(private authService: AuthService, 
              private router: Router, 
              private userService: UserService,
              private snackBar: MatSnackBar) {}


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
  const userRole = sessionStorage.getItem('userRole');
  this.isSuperAdmin = userRole === 'superadmin';
  this.isAdmin = userRole === 'admin';
  this.loadUsers();
}

  editUser(user: any) {
    this.router.navigate(['/admin/user-management/edit-user']);
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
    this.userService.getUsers().subscribe(
      (data) => {
        if (this.isSuperAdmin === true)
        {
          // Filter users by roles excluding 'superadmin'
            this.users = data.filter(user => user.role !== 'superadmin')
              .map((user, index) => ({ ...user, id: index + 1 }));
            this.filteredUsers = [...this.users];
        } else if (this.isAdmin === true){
          // Filter users by roles 'reviewer' and 'author'
          this.users = data.filter(user => user.role === 'reviewer' || user.role === 'author')
                        .map((user, index) => ({ ...user, id: index + 1 }));
        this.filteredUsers = [...this.users];
        }
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
        // Check if the fields are defined before calling toLowerCase()
        const id = user.id ? user.id.toString().toLowerCase() : '';
        const firstName = user.firstName ? user.firstName.toLowerCase() : '';
        const lastName = user.lastName ? user.lastName.toLowerCase() : '';
        const email = user.email ? user.email.toLowerCase() : '';
        const role = user.role ? user.role.toLowerCase() : '';
  
        // Filter the users based on any of the fields containing the searchTerm
        return id.includes(searchTerm) ||
               firstName.includes(searchTerm) ||
               lastName.includes(searchTerm) ||
               email.includes(searchTerm) ||
               role.includes(searchTerm);
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
