# UCL Computer Science Alliances — Talent Platform V1: User Journey Map

**Last updated:** 13 March 2026

---

## How to Read This Document

Journey flows are written as inline sequential steps using arrow notation (→). Where a user's path branches — because of their tier, a consent state, or a platform restriction — both paths are described in the same paragraph so the full picture is visible in context. The word "restriction" is used where a user encounters a boundary; this is not a failure state, it is the intended platform behaviour.

Login and session routing are documented once in Section 1. All subsequent sections assume the user is already signed in. The user's starting location within the platform is stated at the opening of each section.

L5 items are stretch goals and are called out inline with a note at the start of the relevant section. They are included for completeness; they are not on the critical path for V1 delivery.

---

## User Types Covered

**Student.** Accesses the platform by role assignment only. No membership tier. Manages their own profile, consent settings, and CV library. Not associated with any organisation.

**Recruiter — Silver.** An approved industry recruiter at Silver tier. Can post jobs and view basic consented student information. Cannot access the full student search interface.

**Recruiter — Gold.** Everything available to Silver, plus access to the full student search interface and complete student profiles.

**Recruiter — Platinum.** Everything available to Gold, plus a dedicated "Recommended Students" tab populated by admin curation.

**Admin.** Full platform access across all surfaces. Bypasses all tier and consent gates for operational purposes. Manages company approvals, suspensions, recommendation assignments, and reviews dashboard metrics.

A recruiter whose company registration is pending is redirected to a holding page and cannot access the talent discovery surface. This transitional state is described within the recruiter registration flow in Section 2 and is not treated as a distinct user type because there is no feature access to journey through until approval is granted.

---

## 1. Authentication and Post-Login Routing

This section applies to all user types.

### 1.1 Signing In

A user arrives at `/sign-in` → enters their email address and password → the system validates credentials against the stored record → if the credentials are incorrect, the sign-in form shows an inline message and the user remains on the page with no session created.

If credentials are valid, the system generates a JWT session token encoding the user's role keys and, for recruiters, their membership tier rank and tier key → the user is redirected to `/post-sign-in` → the system reads the role keys from the token to determine where to send the user next.

### 1.2 Post-Login Routing by Role

A user with the STUDENT role is redirected to `/talent-discovery?view=student`, landing on their profile and consent dashboard.

A user with the RECRUITER role whose organisation has status PENDING is redirected to a holding page confirming their registration is under review. No talent discovery surface is accessible. Each subsequent login will show the same holding page until an admin changes the organisation status.

A user with the RECRUITER role whose organisation has status APPROVED is redirected to `/talent-discovery?view=job-board`. What they can access within that view depends on their membership tier and is described in the relevant feature sections below.

A user with the RECRUITER role whose organisation has status SUSPENDED or BANNED is redirected to an access-denied page. They cannot reach the talent discovery surface.

A user with the ADMIN role is redirected to `/membership-dashboard`, from which they can navigate to the talent discovery admin panel and all other platform surfaces.

### 1.3 Signing Out

Any signed-in user selects "Sign out" from the account menu in the header → the session token is invalidated → the user is returned to `/sign-in`.

---

## 2. Registration

### 2.1 Student Registration

A prospective student arrives at the platform's sign-in page → selects the option to register as a student → enters their UCL email address and a chosen password → the system validates that the email matches the expected UCL domain format. During development a maintained dummy domain list is used for this check during development with real UCL domain planned for the final 2.5 weeks of the project.

If the domain does not match, registration is declined with an inline message directing the user to check their email or contact the platform administrator.

If the domain is valid, the system creates a user account with the STUDENT role assigned → no organisation or membership row is created, as students access the platform by role only → the student is shown a confirmation and directed to sign in → on first sign-in they are routed to `/talent-discovery?view=student`, where they land on an empty profile ready to complete.

### 2.2 Recruiter Registration

A prospective recruiter arrives at the sign-in page → selects the option to register as a recruiter → enters their work email address and their company name → the system checks whether the email domain corresponds to a recognised or previously approved company using a dummy domain list during development. If the domain is not recognised, the user is advised to contact the platform administrator.

If the domain passes the check, the system creates a user account with the RECRUITER role → creates an organisation record for their company with status set to PENDING → creates a membership record linking the user to the organisation at Bronze tier as a technical placeholder → the recruiter is directed to sign in.

On sign-in the system detects the organisation status is PENDING → the recruiter is shown a holding page confirming their registration has been submitted for admin review. They can sign out and return at any time; each subsequent login will show the same holding page until their organisation is approved by an admin (see Section 9.1).

Once their organisation is approved and a membership tier has been assigned, the recruiter's next login routes them to the full recruiter view with the tier assigned during the approval.

---

## 3. Student Profile

The student is on `/talent-discovery?view=student`.

### 3.1 Viewing and Editing Profile Fields

The student's view displays their current profile state → the student can edit their skills, work experience, educational background, certifications, and projects → completed fields are saved via a submit action → the system validates required field formats and surfaces any issues inline without blocking submission of unaffected fields.

The profile can be built incrementally. A student is not required to complete all sections before using other features such as consent controls or CV upload.

### 3.2 External Profile Links

Within the profile editing interface the student can add links to external profiles → they enter a URL for LinkedIn, GitHub, or a personal site → the system stores these as plain text values associated with their account → the links are displayed alongside their profile fields and, once consent is given, are visible to recruiters who can access their profile.

### 3.3 Profile Visibility

A student's profile data is only surfaced to recruiters if consent has been given (see Section 4). Editing or completing the profile does not affect consent state. Consent and profile completeness are independent controls.

---

## 4. Consent and Visibility Controls

The student is on `/talent-discovery?view=student`, in the consent section.

### 4.1 Binary Consent Toggle

The consent section displays the student's current overall visibility state → the student can switch their overall consent to "opted in" (their profile may be viewed by approved recruiters subject to company-level settings) or "opted out" (their profile is not visible to any recruiter, regardless of company-level settings) → the change takes effect immediately → no recruiter can retrieve the student's data once consent is withdrawn.

The default state for a newly registered student account is opted out. The student must actively choose to share their profile.

### 4.2 Per-Company Visibility Controls

Within the consent section the student can see a list of currently approved companies on the platform → for each company the student can mark it as included or excluded → this operates as a layer on top of the overall consent toggle.

If a student has opted in overall but has excluded a specific company, that company's recruiters cannot see the student's profile when searching or browsing. If a student has opted out overall, their per-company settings are preserved but have no effect until overall consent is restored, at which point the per-company configuration becomes active again immediately.

The default per-company state for any newly approved company is included. A student who has given overall consent but has not interacted with per-company settings will be visible to all approved recruiters. A student who wants to limit visibility to specific companies should explicitly exclude those they do not want to share with.

---

## 5. Job Board

### 5.1 Student — Viewing Job Listings

The student navigates to the job listings section within their talent discovery view → the system retrieves all currently active postings from approved organisations → the student sees a list of roles showing title, organisation name, location, role type, and salary band where the recruiter has provided one → the student can browse and read individual listings in full.

There is no application mechanism on the platform. Job listings are informational. Any application process takes place outside the platform, typically via the contact details or links provided in the posting.

Viewing job listings does not require the student to have given consent. Browsing postings involves no data sharing with recruiters.

### 5.2 Recruiter (Silver, Gold, Platinum) — Posting a Job

A recruiter navigates to the job board section of their recruiter view → selects the option to post a new role → completes the form with the required fields: title, location, role type, and description → optionally adds a salary band and an expiry date → submits → the system validates that all required fields are present and that any date fields are correctly formatted → if validation fails, issues are shown inline.

On successful submission the system creates a job posting record linked to the recruiter's organisation, marked as active and timestamped at the time of posting → the posting appears in the student-facing listings immediately.

The recruiter can return to manage their existing postings → they can edit the content of a posting, mark it as inactive to remove it from student view, or delete it. Marking a posting inactive does not delete the record; the data is retained but the posting is no longer shown to students.

If an expiry date was set, the posting is treated as inactive automatically once that date passes without the recruiter needing to take any action.

All three approved recruiter tiers — Silver, Gold, and Platinum — have identical job posting permissions.

---

## 6. CV Library

The student is on `/talent-discovery?view=student`, in the CV section.

### 6.1 Uploading a CV

The student selects the option to upload a CV → the upload interface accepts PDF and DOCX files → the student provides a label for the CV, such as "General application" or "Machine learning roles" → submits → the system passes the file and the label to the CV storage service.

The underlying storage destination — whether an external file host or a database-backed reference — is an implementation concern handled entirely by the storage service. From the student's perspective the CV is uploaded, labelled, and associated with their account.

If the upload fails due to an unsupported file type or a storage service error, the student receives an inline message indicating the failure. No partial record is created and the student is prompted to retry.

### 6.2 Managing Multiple CVs

A student can upload more than one CV, each with a distinct label → all uploaded CVs are listed with their label and upload date → the student can replace a CV by uploading a new file against the same record, which substitutes the file while preserving the label → the student can delete a CV, which removes the record and the underlying stored file → there is no upper limit on the number of CVs a student can maintain.

All CVs associated with a student's account are subject to the same consent rules as the rest of the profile. If a recruiter can access the student's profile, they can access all of that student's uploaded CVs.

### 6.3 CV Keyword Tagging (Stretch — L3)

After uploading a CV the student can optionally add keyword tags to it → tags are entered as free text and stored as a normalised string associated with the CV record → tags can be edited or cleared at any time.

Tags assist the admin recommendation process (Section 9.3) by providing a searchable signal for matching students to firms. This feature does not affect CV upload, profile visibility, or recruiter search functionality and can be deferred without blocking other features.

---

## 7. Recruiter Search

The recruiter is on `/talent-discovery` in their recruiter view. This feature is only available at Gold and Platinum tier. Silver tier recruiters cannot access the search interface.

### 7.1 Recruiter (Silver) — Access Restriction

A Silver tier recruiter navigating the talent discovery surface does not see the student search interface. The recruiter view communicates that full student search requires a higher membership tier. The Silver recruiter retains full access to the job board and any students surfaced to them via the recommendation tab if they are promoted to Platinum in future.

### 7.2 Recruiter (Gold) — Searching Consented Students

A Gold tier recruiter opens the search interface → they enter search criteria: location, degree type, and optionally years of experience → the system queries the pool of students who have given overall consent and have not excluded the recruiter's organisation → only students meeting both conditions are considered, regardless of how many students are registered on the platform.

The results show a summary for each matching student — name, degree, location, and top skills → the recruiter opens a full profile from the summary → the full profile includes all fields the student has completed: skills, experience, certifications, projects, external links, and all uploaded CVs.

If a student has not consented, or has excluded the recruiter's organisation, they do not appear in search results in any form. Their existence is not surfaced. If the search returns no results, the recruiter sees an empty state indicating no matching students have made themselves available to their organisation. No distinction is drawn between "no students match the criteria" and "students match but have not consented" — this protects student privacy.

### 7.3 Recruiter (Platinum) — Recommended Students Tab

A Platinum tier recruiter has everything available to Gold, plus a "Recommended Students" tab in their recruiter view → this tab shows students that an admin has explicitly tagged as a recommendation for their specific organisation → the list is populated and managed entirely by the admin (see Section 9.3).

The recommended students shown here are scoped exclusively to the recruiter's own organisation. A recruiter from one firm cannot see recommendations that an admin has made to a different firm.

When an admin revokes a recommendation, the student disappears from the recruiter's recommended tab immediately. The recruiter receives no notification that a recommendation has been removed.

---

## 8. Account Deletion

### 8.1 Student

The student navigates to their account settings → selects the option to delete their account → the system presents a confirmation step to prevent accidental deletion → the student confirms.

The system removes the student's user record and all associated platform data — profile fields, CV records, consent records, skill and experience entries — within a single database transaction. If any part of the deletion fails, the entire transaction is rolled back and the account is preserved intact. The student is advised to retry or contact support.

On successful deletion the student's session is invalidated and they are returned to the sign-in page. Attempting to sign in with the deleted account's credentials will fail as no account exists.

Audit log entries recording that a recruiter accessed the student's profile are retained after deletion. These records do not contain the student's profile content — they record the access event only — and are preserved for compliance purposes.

---

## 9. Admin Operations

The admin is signed in. All talent platform admin functions are accessible from the admin panel within the talent discovery surface or via the admin navigation in the header. The admin bypasses all tier and consent gates.

### 9.1 Company Approval

The admin opens the company management section → the system lists all organisations with status PENDING, showing company name, the email domain used during registration, and the date the registration was submitted.

The admin selects a pending organisation and reviews its details → they can approve the company or reject it.

To approve: the admin selects a membership tier — Silver, Gold, or Platinum — and confirms → the system updates the organisation status to APPROVED and updates the Membership tier for all RECRUITER users linked to that organisation → the next time those recruiters sign in, their session will reflect the new tier and they will be routed to the full recruiter view.

To reject: the admin confirms the rejection → the organisation status is updated to a non-approved state → the recruiter's next login will continue to show an access-denied or holding page.

If an approved organisation later violates platform terms, the admin can return to the company management view and update the organisation status to SUSPENDED or BANNED → recruiters from that organisation are blocked from accessing the talent discovery surface from their next login onwards.

### 9.2 Suspend and Ban

The admin searches for a specific student or recruiter by name or email in the user management section → opens their record → selects the option to suspend the user's access to the talent discovery surface.

The admin enters a reason for the suspension and confirms → the system creates a suspension record scoped specifically to the talent discovery application, recording the user, the reason, and the timestamp. The user's account is not deleted or modified — they continue to have access to other platform applications such as the membership dashboard if they belong to them.

On the suspended user's next attempt to access the talent discovery surface, the access check detects the active suspension record and redirects them to an access-denied page. The reason shown to the user is a generic access message; the admin's internal reason is stored in the suspension record.

To lift a suspension, the admin locates the suspension record for that user, confirms the lift, and the system records the lifted timestamp → the user's access is restored on their next request. No action is required from the user.

### 9.3 Recommendation Gateway

The admin opens the recommendation section of the talent platform admin panel → selects a recruiter organisation to manage recommendations for → the admin sees the current list of students recommended to that firm and a filter panel for adding new ones.

The admin applies filters to the consented student pool — available dimensions are location, degree type, years of experience, and CV keyword tags where tagging has been used. The filter results show only students who have given overall consent and have not excluded the selected firm from their per-company settings. Students not meeting these conditions are not visible in the filter results, ensuring the admin cannot surface a student to a recruiter against the student's own consent choices.

The admin reviews the filtered list → selects one or more students → confirms adding them as recommendations for the selected organisation → the system creates recommendation records linking each student to the firm, recording the admin who made the recommendation and the timestamp.

The selected students then appear in the Platinum tier recruiter's "Recommended Students" tab for that organisation. No other organisation can see this list.

To revoke a recommendation, the admin returns to the recommendation view for that firm → locates the student → selects revoke → the system records the revocation timestamp → the student disappears from the recruiter's recommended tab immediately. The recommendation record is not deleted; it is retained with the revocation timestamp for audit purposes.

The admin can revoke and create new recommendations at any time, giving continuous control over which students are surfaced to each firm.

### 9.4 Admin Dashboard Metrics

The admin opens the talent platform dashboard view → the system computes and displays a live summary of platform health.

The metrics shown are: total number of registered students, number of students who have given overall consent, number of approved recruiter organisations, and the count of matchable student-firm pairs (students who have consented and have not excluded a given firm, considered against the recruiter organisations approved on the platform).

The purpose of these metrics is to answer one operational question: how many users have passed initial verification and can use the platform without friction. A student who has registered but not yet given consent, and a recruiter whose company is still pending, are both examples of users not yet contributing to the matchable pool — the dashboard makes this visible at a glance.

---

## 10. Notifications and Contact (Stretch — L5)

The features in this section are stretch goals for L5. They are not required for the core talent platform to function and are included here to complete the picture of the intended V1 scope.

### 10.1 Recruiter Contacts a Student (Stretch)

A Gold or Platinum recruiter viewing a student's full profile can choose to initiate contact → the profile interface provides a contact action → selecting it generates a pre-addressed email link to the student's registered email address → clicking the link opens the recruiter's external email client with the address pre-filled.

All communication takes place outside the platform. The platform's role is to surface the contact point; the conversation itself is not managed or stored within the system. A tooltip or status message in the interface confirms that communication is handled externally.

### 10.2 Student Notified of Recruiter Interest (Stretch)

When a recruiter initiates the contact action for a student, the platform records the event → the student's registered email address receives a notification informing them that a recruiter from a named organisation has expressed interest in their profile.

As a further stretch addition beyond the email notification, an in-platform indicator — such as a bell icon or notification count in the header — can be added to surface this type of event within the platform itself. This notification indicator would be scoped exclusively to recruiter contact events and would not be used for any other platform communications.
