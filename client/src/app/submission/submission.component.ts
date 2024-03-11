import { Component, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService} from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.css']
})
export class SubmissionComponent {
  journalTitle: string = '';
  authors: string = '';
  abstract: string = '';
  keywords: string = '';
  selectedFile: File | null = null;

  isDropdownOpen = false;

  constructor(private http: HttpClient, 
              private authService: AuthService, 
              private router: Router,
              private snackBar: MatSnackBar) {}

  submitJournal() {
    const formData = new FormData();
    formData.append('journalTitle', this.journalTitle);
    formData.append('authors', this.authors);
    formData.append('abstract', this.abstract);
    formData.append('keywords', this.keywords);
    
    // Get userId from local storage
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in local storage');
      return;
    }
  
    formData.append('userId', userId);
  
    if (this.selectedFile) {
      formData.append('journalFile', this.selectedFile, this.selectedFile.name);
    }
  
    this.http.post<any>('https://jms-backend-testing.vercel.app/journals', formData).subscribe(
      (response) => {
        console.log(response.message);
        // Reset form fields after successful submission
        this.journalTitle = '';
        this.authors = '';
        this.abstract = '';
        this.keywords = '';
        this.selectedFile = null;
      },
      (error) => {
        console.error(error);
        this.snackBar.open('Submission failed!', 'Close', { duration: 3000, verticalPosition: 'top'});
        // Handle error
      }
    );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
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
