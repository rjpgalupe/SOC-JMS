import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { AuthGuard } from './auth.guard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Add this import
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Add this import
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FPassComponent } from './f-pass/f-pass.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ReviewerDashboardComponent } from './reviewer-dashboard/reviewer-dashboard.component';
import { AdminAccountComponent } from './admin-account/admin-account.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ReviewerManagementComponent } from './reviewer-management/reviewer-management.component';
import { JournalManagementComponent } from './journal-management/journal-management.component';
import { SubmissionComponent } from './submission/submission.component';
import { CreateReviewerComponent } from './create-reviewer/create-reviewer.component';
import { AssignReviewerComponent } from './assign-reviewer/assign-reviewer.component';
import { ReviewerAssignedJournalComponent } from './reviewer-assigned-journal/reviewer-assigned-journal.component';
import { ReviewerViewJournalComponent } from './reviewer-view-journal/reviewer-view-journal.component';
import { ResearcherDashboardComponent } from './researcher-dashboard/researcher-dashboard.component';
import { ResearcherJournalStatusComponent } from './researcher-journal-status/researcher-journal-status.component';
import { SuperadminUserManagementComponent } from './superadmin-user-management/superadmin-user-management.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { VerifyEmailResultComponent } from './verify-email-result/verify-email-result.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RubricManagementComponent } from './rubric-management/rubric-management.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { CreateRubricComponent } from './create-rubric/create-rubric.component';
import { ViewRubricComponent } from './view-rubric/view-rubric.component';
import { ConsolidationFeedbackComponent } from './consolidation-feedback/consolidation-feedback.component';
import { ResearcherViewJournalComponent } from './researcher-view-journal/researcher-view-journal.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},
  { path: 'forgot-password', component: FPassComponent},
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { expectedRoles: ['superadmin', 'admin'] }},
  { path: 'researcher/dashboard', component: ResearcherDashboardComponent, canActivate: [AuthGuard], data: { expectedRoles: ['author'] }},
  { path: 'reviewer/dashboard', component: ReviewerDashboardComponent, canActivate: [AuthGuard], data: { expectedRoles: ['reviewer'] }},
  { path: 'admin/user-management', component: UserManagementComponent},
  { path: 'admin/reviewer-management', component: ReviewerManagementComponent},
  { path: 'admin/journal-management', component: JournalManagementComponent},
  { path: 'researcher/journal-submission', component: SubmissionComponent},
  { path: 'admin/review-management/create-reviewer', component: CreateReviewerComponent},
  { path: 'admin/review-management/assign-reviewer/:journalId/:journalTitle', component: AssignReviewerComponent },
  { path: 'reviewer/assigned-journals', component: ReviewerAssignedJournalComponent},
  { path: 'reviewer/view-journal/:journalId', component: ReviewerViewJournalComponent},
  { path: 'researcher/journal-status', component: ResearcherJournalStatusComponent},
  { path: 'superadmin/user-management', component: SuperadminUserManagementComponent},
  { path: 'user-management/add-accounts', component: CreateAccountComponent},
  { path: 'account-settings', component: AccountSettingsComponent},
  { path: 'verify-email/:email', component: VerifyEmailComponent },
  { path: 'verify-email-result', component: VerifyEmailResultComponent },
  { path: 'reset-password/:resetToken', component: ResetPasswordComponent},
  { path: 'admin/rubric-management', component: RubricManagementComponent},
  { path: 'admin/user-management/edit-user', component: EditUserComponent},
  { path: 'admin/rubric-management/create-rubric', component: CreateRubricComponent},
  { path: 'admin/rubric-management/view-rubric/:rubricId', component: ViewRubricComponent},
  { path: 'view-rubric/:rubricId', component: ViewRubricComponent},
  { path: 'admin/consolidation-feedback/:journalId', component: ConsolidationFeedbackComponent},
  { path: 'researcher/view-journal/:journalId', component: ResearcherViewJournalComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    FPassComponent,
    AdminDashboardComponent,
    ReviewerDashboardComponent,
    AdminAccountComponent,
    UserManagementComponent,
    ReviewerManagementComponent,
    JournalManagementComponent,
    SubmissionComponent,
    CreateReviewerComponent,
    AssignReviewerComponent,
    ReviewerAssignedJournalComponent,
    ReviewerViewJournalComponent,
    ResearcherDashboardComponent,
    ResearcherJournalStatusComponent,
    SuperadminUserManagementComponent,
    CreateAccountComponent,
    AccountSettingsComponent,
    VerifyEmailComponent,
    VerifyEmailResultComponent,
    ResetPasswordComponent,
    RubricManagementComponent,
    EditUserComponent,
    CreateRubricComponent,
    ViewRubricComponent,
    ConsolidationFeedbackComponent,
    ResearcherViewJournalComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule, // Add this line
    MatTabsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
