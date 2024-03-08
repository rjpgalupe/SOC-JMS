import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { JournalService } from '../journal.service';


@Component({
  selector: 'app-researcher-view-journal',
  templateUrl: './researcher-view-journal.component.html',
  styleUrls: ['./researcher-view-journal.component.css']
})
export class ResearcherViewJournalComponent implements OnInit{
  journalId: string = '';
  journalTitle: string = '';
  consolidatedFeedback: string = '';

  constructor (private router: Router, private authService: AuthService, private route: ActivatedRoute, private journalService: JournalService) {}

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
  
  logout() {
    this.authService.setIsUserLogged(false);
    this.router.navigate(['login'])
  } 
}
