import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../journal.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consolidation-feedback',
  templateUrl: './consolidation-feedback.component.html',
  styleUrls: ['./consolidation-feedback.component.css']
})
export class ConsolidationFeedbackComponent implements OnInit {
  journalId: string = ''; 
  feedback: any[] = []; 
  consolidatedFeedback: string = ''; 
  adminChoice: string = ''; 
  journalTitle: string = '';
  

  constructor(private route: ActivatedRoute, private journalService: JournalService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.journalId = params.get('journalId') || ''; 
      if (this.journalId) {
        this.getJournalDetails();
        this.getConsolidateFeedback();
      }
    });
  }

  getJournalDetails(): void {
    this.journalService.getJournalById(this.journalId)
      .subscribe(
        (data) => {
          this.journalTitle = data.journalTitle;
        },
        (error) => {
          console.error(error);
          // Handle error scenario
        }
      );
  }

  getConsolidateFeedback(): void {
    this.journalService.getConsolidateFeedback(this.journalId)
      .subscribe(
        (data) => {
          // Map reviewer _id to their names
          this.feedback = data.feedback.map((item: any) => ({
            reviewer: item.reviewerName,
            feedback: item.feedback,
            choice: item.choice
          }));
        },
        (error) => {
          console.error(error);
          // Handle error scenario
        }
      );
  }

  submitConsolidatedFeedback(): void {
    // Here you can send the consolidated feedback and admin choice to the server
    // For example:
    this.journalService.submitConsolidatedFeedback(this.journalId, this.consolidatedFeedback, this.adminChoice)
      .subscribe(
        (data) => {
          console.log("Sent")
        },
        (error) => {
          console.error(error);
          // Handle error scenario
        }
      );
  }

  logout() {
    this.authService.setIsUserLogged(false);
    this.router.navigate(['login'])
  } 
}
