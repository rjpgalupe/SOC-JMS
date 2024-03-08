import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { JournalService } from '../journal.service';

@Component({
  selector: 'app-researcher-journal-status',
  templateUrl: './researcher-journal-status.component.html',
  styleUrls: ['./researcher-journal-status.component.css']
})
export class ResearcherJournalStatusComponent {
  journals: any[] = [];
  filteredJournals: any[] = [];
  searchQuery: string = '';

  isDropdownOpen = false;

  constructor(private authService: AuthService, 
              private router: Router, 
              private journalService: JournalService, ) {}

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

  viewJournal(journalId: string): void {
    this.router.navigate(['/researcher/view-journal', journalId]);
  }


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
