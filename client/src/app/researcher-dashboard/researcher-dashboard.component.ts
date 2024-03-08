import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-researcher-dashboard',
  templateUrl: './researcher-dashboard.component.html',
  styleUrls: ['./researcher-dashboard.component.css']
})
export class ResearcherDashboardComponent {
  constructor(private authService: AuthService, private router: Router) {}
  isDropdownOpen = false;

  logout() {
    this.authService.setIsUserLogged(false);
    this.authService.clearUserId();
    this.router.navigate(['login'])
    } 

    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
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
}
