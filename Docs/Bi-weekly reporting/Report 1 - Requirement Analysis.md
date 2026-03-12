![Image result for Ucl logo][image1]

**Talent** 

    **Progress Report 1：**

  **Requirement Analysis**

                                                                                 

          Gian Prem Rajaram                                                [gian.rajaram.23@ucl.ac.uk](mailto:gian.rajaram.23@ucl.ac.uk)

          Sadhana Jayakumar                                               [sadhana.jayakumar.25@ucl.ac.uk](mailto:sadhana.jayakumar.25@ucl.ac.uk)

      Adam Benmohamed                                              [adam.benmohamed.25@ucl.ac.uk](mailto:adam.benmohamed.25@ucl.ac.uk)	

          Lienqi Peng                                                           [lienqi.peng.25@ucl.ac.uk](mailto:lienqi.peng.25@ucl.ac.uk)

          Chengyu Yang                                                      [chengyu.yang.25@ucl.ac.uk](mailto:chengyu.yang.25@ucl.ac.uk)   
					

**COMP0067 App Engineering**

**January 27, 2026**

Department of Computer Science

University College London

## **1\. Introduction**

**Talent Platform \- UCL Computer Science CV Concierge Library**

## **1.1 Client Introduction**

The client for this project is the **Strategic Alliances Team at UCL**. They are responsible for managing platform operations, partner verification, and system-wide governance.

**Key Stakeholders:**

* Dr Daniel Hajas, Strategic Alliances Client Team: (platform operations/strategy; requirements, accessibility, and architecture consultation)  
* Dr Yun Fu (Academic Supervisor)  
* UCL IT (infrastructure, SSO integration, security compliance)  
* UCL Legal (GDPR compliance, consent management frameworks)

### **1.2 Project Background and Problem Statement**

UCL Computer Science students lack an institution-verified recruitment channel with granular consent controls. **Missing capabilities across current platforms:**

* Direct employer outreach: No institutional vetting layer creates high-volume, low-quality contact patterns; students spend significant time filtering irrelevant opportunities that bypass Career Services quality standards.  
* LinkedIn/Indeed: Limited recruiter visibility (intermittent "viewed profile" notifications provide partial transparency but no systematic audit trail); no filtering mechanism for role quality or employer legitimacy.  
* Handshake: Active application model only; lacks passive discovery where recruiters browse and initiate contact; minimal integration of academic context beyond course listings.


**Core value proposition:** Passive recruitment model where pre-vetted employers actively browse UCL talent pools and initiate outreach, reducing job search burden for students. This inverts the traditional application dynamic by positioning students as discoverable talent rather than active applicants, while maintaining granular consent and audit controls throughout.  

UCL's platform capabilities handle data privacy requirements, including GDPR compliance for student data processing and granular consent management. 

This project is one of three components within UCL's broader platform roadmap. We are evaluating two architectural approaches (existing codebase vs standalone build), and will finalise our approach by 1-Feb’26 following the Strategic Alliances Team's input on long-term platform integration needs.

### **1.3 Accessibility & Inclusion**

We ensure the Talent platform is inclusive by design, adhering to the principle that professional opportunities should be accessible to all students regardless of their physical, cognitive, or technical circumstances. Our key tenets for accessibility are:

* **Mobile-First Performance Strategy:** Prioritising development for budget mobile devices (lower CPU, limited RAM, high latency) to ensure the platform is non-exclusionary for students without high-end hardware.  
* **Keyboard-Only Navigation:** Evaluating full keyboard-only navigation to benefit users with motor impairments and support screen readers (currently assessing technical complexity for consent toggles).  
* **Cognitive Clarity:** Reducing "administrative tax" via a distraction-free UI.  
* **Standards Compliance:** Alignment with **WCAG 2.1 AA** standards.  
* **Inclusion Factors:** Assistive technology compatibility (semantic HTML), Perceivability (contrast ratios), and Inclusive Language (gender-neutral, ESL optimized).

### **1.4 Project Goals**

**Primary Objectives:**

- **Student control:** Enable granular CV visibility permissions, allowing students to grant or revoke access to the platform and manage consent preferences  
- **Tiered access management:** Implement cumulative permission logic tied to UCL's partner tiers (Bronze: none; Silver: job board; Gold/Platinum: job board \+ CV library; Students: full access)  
- **Passive discovery:** Enable verified companies to browse and initiate contact with student profiles, removing the active application requirement while maintaining student consent controls.  
- **Academic context integration:** Provide structured fields for students to input verified academic data (coursework, projects, research) and link external portfolios (LinkedIn, GitHub).  
- **Administrative oversight:** Provide the Strategic Alliances Team with permissions to manage platform operations and partner access controls

## **1.5 Project Management & Contributions**

**2-week plan:** (**1**) 30-Jan: HLD and accessibility consultation with Dr Hajas finalised. (**2**) 1-Feb architecture and stack decisions complete. (**3**) 3-Feb: v1 HLD shared with team for cross-review. (**4**) 4-Feb: Technical components split into GitHub issues with assignments, initiating one-week sprint cycles (one-week buffer for language ramp-up). (**5**) 9-Feb: Each member drafts v1 LLDs, team completes Report 2 HCI design; sprint kickoff begins 9 Feb.

1. **Lienqi Peng**: Co-led use case diagram build, clarified tech scope for CV library feature (client priority) via team-feedback.  
2. **Chengyu Yang**: Co-Led use case diagram build, researched and documented report 1 requirements, programming language learning material to support ramp-up of wider team to tech-stack, accelerating development start timelines.  
3. **Adam Benmohamed**: Surfaced payment system integration risk with client, clarifying scope. Led research on the MoSCoW method, AI tool usage constraints.  
4. **Sadhana Jayakumar (Tech Lead)**: Led requirements elicitation with the client, validating prioritisation scope and deep-dive into the existing codebase/architecture received from client, impacting solution architecture. Provided technical knowledge on feature complexity and prioritisation decisions during team calls.  
5. **Gian Prem Rajaram (Team Lead)**: Led client call, drafted BRD end-to-end (42 prioritised user stories, market research, accessibility/inclusion), later refined via team input and drafted v1 Report 1\. Established BRD/HLD/LLD documentation structure aligned with SDLC practices.

## **1.6 Software Development Lifecycle**

The project follows a **four-tier** documentation approach aligned with agile SDLC practices: 

**(1) Business Requirements Document (BRD)** captures client needs, market research, and project scope, establishing what will be built and why. **(2) High-Level Design (HLD)** translates requirements into system architecture, defining major components, technology stack, data flow, and integration points. **(3) Low-Level Designs (LLDs)** are component-specific specifications owned by individual team members, documenting implementation approaches for assigned features. Component separation enables knowledge sharing across the team and cross-review of LLDs for technical support and code reuse. **(4) Bi-weekly Progress Reports** align with sprint cadences, providing academic checkpoints.

Backlog management and ticket tracking are handled through GitHub.

## **2\. Requirements Analysis**

## **2.1 Requirements Elicitation**

Requirements were gathered through multiple elicitation techniques to ensure comprehensive understanding of stakeholder needs:

**Interview Sessions:**

* Initial kickoff meeting with the Strategic Alliances Team (meeting summary dated 23-Jan)  
* Technical discussions regarding existing infrastructure (web hosting available; database procurement required)  
* Accessibility consultation requirements identified, and will be covered in the next client conversation (ETA 29-Jan) (Daniel Hajas, Dr Yun)

**Document Analysis:**

* Review of UCL IXN platform ([**https://ixn.cs.ucl.ac.uk/**](https://ixn.cs.ucl.ac.uk/)) as a reference for UX inspiration  
* Analysis of tiered industry partner framework (Gold/Platinum/Silver/Bronze access levels)  
* Examination of the existing TypeScript placeholder for integration planning

**Stakeholder Workshops:**

* Clarification of job posting vs. CV library user flows (identified as a gap requiring prioritisation)  
* Discussion of multi-user recruiter access and dashboard analytics requirements  
* Validation of consent management logic and student/recruiter relationship dynamics

**Competitive Analysis:**

* LinkedIn: Freemium social network with binary public/private controls; lacks institution-specific curation  
* Handshake: Application-driven model; no passive discovery with granular consent  
* Otta: Tech-focused job board; no academic context or institution verification  
* Indeed/Reed: Job aggregators with a zero consent model; application-only

**Key Differentiators Identified:**

* Hyper-local concierge model with institution-verified profiles  
* Company-specific visibility control (whitelist/blacklist)  
* Audit-first architecture with a transparency dashboard  
* Strategic curation by UCL team (pre-vetted partners only)

**To be covered in next 2-weeks during recurring weekly client calls:**

* UCL SSO technical specifications (Shibboleth/SAML endpoints, technical contact)  
* Accessibility framework compliance requirements (WCAG 2.1 AA baseline confirmed)  
* Data classification level for student CV data  
* Integration strategy with the UCL IXN platform  
* Data Privacy requirements and UCL Legal review process

### **2.2 Users**

The platform supports the following user roles:

* **Students:** UCL CS students who upload CVs and manage consent.  
* **Recruiters:** Industry partners with tiered access:  
  * *Bronze:* No access to the app.  
  * *Silver:* Access to the Job Board (posting jobs) but **no** access to the CV library.  
  * *Gold/Platinum:* Full access, including the CV library.  
* **Strategic Team (Admin):** Super adminsare responsible for approving companies and monitoring analytics.

## **2.2.1 Students (Primary Users)**

**Profile:** UCL Computer Science students seeking career opportunities while maintaining control over personal data

**Characteristics:**

* Tech-savvy; comfortable with digital platforms  
* Privacy-conscious; value data sovereignty  
* Time-constrained; prefer passive recruitment over active job searching  
* Mobile-first usage patterns (budget devices to high-end laptops)

**Key Needs:**

* Granular CV visibility controls (company-specific whitelist/blacklist)  
* Profile auto-population from UCL academic systems  
* Transparency into who viewed their CV and when  
* Ability to update CVs and profile information anytime  
* Mobile-responsive interface supporting low-bandwidth scenarios

**Access:** Full access to all platform functionality after completing consent management process

## **2.2.2 Recruiters (Industry Partners)**

**Profile:** Verified company representatives from Gold/Platinum tier organisations seeking UCL CS talent

**Tiers:**

* **Gold/Platinum:** Full access to CV library, job posting, advanced search/filters  
* **Silver:** Job board access only (no CV library permissions)  
* **Bronze:** No platform access

**Characteristics:**

* Results-driven; value-efficient candidate discovery  
* Operate within corporate ATS ecosystems  
* Require team collaboration features (multi-user access)  
* Need export functionality for internal workflows

**Key Needs:**

* Advanced search and filtering (skills, graduation year, projects)  
* Ability to save and track candidate profiles  
* Anonymised profile previews before requesting CV access  
* Communication tools to reach interested candidates  
* Export capabilities (CSV for ATS integration)

**Access Level:** Search consented student profiles; view CVs with permission; initiate contact; limited to verified company domain

## **2.2.3 Strategic Alliances Team (Super Admins)**

**Profile:** UCL staff managing platform operations, partner verification, and governance

**Characteristics:**

* Non-technical users requiring intuitive admin interfaces  
* Responsible for platform integrity and student data protection  
* Report to university leadership on partnership ROI  
* Manage partner relationships and escalations

**Key Needs:**

* Company registration approval/rejection workflows  
* User account management (suspend/ban functionality)  
* Platform analytics (student engagement, company activity, placement outcomes)  
* No access to student CV content or personal data  
* Tools to demonstrate program value to university leadership

**Access Level:** Full system administration except student data, partner verification, user management, **2.2.4 UCL IT / System Administrators**

**Profile:** Technical staff responsible for infrastructure, security, and compliance

**Characteristics:**

* Security-first mindset  
* Operate within UCL IT policies and standards  
* Require system monitoring and logging capabilities  
* Compliance-focused (GDPR, UK Data Protection Act 2018\)

**Key Needs:**

* Integration with UCL SSO (Shibboleth/SAML)  
* Comprehensive audit logging for compliance  
* Data encryption standards (TLS 1.3, AES-256)  
* System health monitoring and error logs

**Access Level:** System configuration; security settings; audit log access; no access to user content.

### **2.3 MoSCoW Requirements**

The following tables categorise requirements into **Functional** and **Non-Functional**, prioritised using the **MoSCoW** method.

## **2.3.1 Functional Requirements \- Students**

| ID | User Story | MoSCoW | V1  Build? | Effort (xs-xxl) |
| :---- | :---- | :---- | :---- | :---- |
| **AUTHENTICATION & ONBOARDING** |  |  |  |  |
| FR-S-1 | As a student, I need to register using my UCL email or university SSO credentials so that my identity is verified | Must Have | Yes | S |
| FR-S-2 | As a student, I need 2FA for account security so that my profile remains protected | Must Have | Yes | M |
| FR-S-3 | As a student, I need to permanently delete my account and all data so that I exercise my right to have all my information removed from UCL systems (GDPR) | Must Have | Yes | XL |
| **CV MANAGEMENT** |  |  |  |  |
| FR-S-4 | As a student, I need to upload CVs in PDF or DOCX format so that I can use my existing documents | Must Have | Yes | M |
| FR-S-5 | As a student, I need to update, delete, or replace my CV anytime so that my profile stays current | Must Have | Yes | S |
| FR-S-6 | As a student, I need additional profile fields (skills, experience, certifications, research projects) so that companies can filter beyond just my CV | Must Have | Yes | XS |
| FR-S-7 | As a student, I need to tag my CV with keywords (e.g., "Machine Learning", "Blockchain") so that relevant companies discover me easily | Should Have | Yes | S |
| FR-S-8 | As a student, I need to upload multiple CVs (e.g., ML-focused, systems-focused) so that I can target different roles | Should Have | Yes | XS |
| FR-S-9 | As a student, I need keywords extracted automatically from my CV upload so I don't manually tag artefacts | Could Have | No |  |
| FR-S-10 | As a student, I want to see analytics on CV views and company interest so that I understand my market appeal | Could Have | No |  |
| FR-S-11 | As a student, I want to link external profiles (LinkedIn, GitHub, portfolio) so recruiters see my full professional presence | Must Have  | Yes | XS |
| **CONSENT & PRIVACY** |  |  |  |  |
| FR-S-12 | As a student, I need to control visibility with options: public to all verified partners, specific companies only (whitelist/blacklist) | Should Have  | Yes | XL |
| FR-S-13 | As a student, I need to provide or withdraw consent anytime so that my privacy preferences remain flexible | Must Have | Yes | XL |
| FR-S-14 | As a student, I want to be notified when my CV is accessed so that I'm aware of the company's interest | Must Have | No |  |
| FR-S-15 | As a student, I want to see a history of which specific recruiters viewed my profile so that I can track interest patterns | Could Have | No |  |
| **COMMUNICATION** |  |  |  |  |
| FR-S-17 | As a student, I want to be notified when a company wishes to contact me so that I can respond promptly | Must Have | Yes | M |
| FR-S-18 | As a student, I want to rate my interaction experience with companies so that future students have visibility into partner quality | Could Have | No |  |

## **2.3.2 Functional Requirements \- Recruiters (Industry Partners)**

| ID | User Story | MoSCoW | V1 Build? | Effort ( |
| :---- | :---- | :---- | :---- | :---- |
| **AUTHENTICATION & ONBOARDING** |  |  |  |  |
| FR-R-1 | As a recruiter, I need to register using a verified company email domain so that the Strategic Team can verify my organization before granting platform access. | Must Have | Yes | M |
| FR-R-2 | As a recruiter lead, I want multiple team members to access our organisation's account so that colleagues can search CVs and post jobs without sharing login credentials. | Could Have | No |  |
| **SEARCH & DISCOVERY** |  |  |  |  |
| FR-R-3 | As a recruiter, I need to search for students by skills, experience, education, and location so that I find relevant candidates | Must Have | Yes | L |
| FR-R-4 | As a recruiter, I need advanced filters (graduation year, degree program, project experience) to narrow candidates so that search results are highly relevant | Should Have | No |  |
| FR-R-5 | As a recruiter, I want to save favourite student profiles so that I can return to strong candidates later | Could Have | No |  |
| FR-R-6 | As a recruiter, I need to export saved candidates to CSV/Excel so that I can integrate with our ATS | Could Have | No |  |
| FR-R-7 | As a recruiter, I need anonymised profile previews (skills, education, no name/contact) before requesting full CV access so that I don't waste consent interactions | Could Have | No |  |
|  **COMMUNICATION** |  |  |  |  |
| FR-R-8 | As a recruiter, I need to contact students via email so that I can proceed with hiring processes | Must Have | Yes | XS |
| FR-R-9 | As a recruiter, I need to contact students through the platform so that communication is centralised and trackable | Could Have | No |  |
| FR-R-10 | As a recruiter, I want templated outreach messages so that I can efficiently contact multiple candidates while personalising key details | Could Have | No |  |
| FR-R-11 | As a recruiter, I want conversation history with each candidate centralised so that my team maintains context across touchpoints | Could Have | No |  |
| **RECRUITMENT MANAGEMENT** |  |  |  |  |
| FR-R-12 | As a recruiter, I need a dashboard to manage recruitment pipelines (shortlist, interviewing, offer) so that I can track candidates systematically | Could Have | No |  |
| FR-R-13 | As a company admin, I want to track my team's recruitment activity (searches, profiles viewed, contacts) so that I can evaluate team performance | Could Have | No |  |
| FR-R-14 | As a recruiter, I want to specify job title, location, salary band, role type, requirements, and description so that students have complete information to evaluate fit when posting job descriptions. | Must have | Yes | XS |

## **2.3.3 Functional Requirements \- Strategic Alliances Team (Super Admins)**

| ID | User Story | MoSCoW | V1 Build | Effort |
| :---- | :---- | :---- | :---- | :---- |
| **USER & PARTNER MANAGEMENT** |  |  |  |  |
| FR-A-1 | As a super admin, I need to approve/reject company registrations so that platform integrity is maintained | Must Have | Yes | L |
| FR-A-2 | As a super admin, I need to remove access for users if  suspend or ban users (students or companies) violating terms, so that platform quality is enforced | Should Have | Yes | XL |
| **ANALYTICS & REPORTING** |  |  |  |  |
| FR-A-3 | As a super admin, I need analytics on platform usage (student engagement rates, company activity, placement outcomes) so that I can measure partnership ROI and report to leadership | Could Have | No |  |
| FR-A-4 | As a super admin, I want to track "success metrics" like student placement rates and time-to-hire so that I can demonstrate program value to university leadership | Could Have | No |  |
| **GOVERNANCE** |  |  |  |  |
| FR-A-5 | The system must log all CV access events (who, when, what action) for audit and compliance purposes | Could Have | No |  |
| **CONSENT & ACCESS MANAGEMENT** |  |  |  |  |
| FR-A-6 | As a super admin, I need to manage student consent verification workflows so that students gain full platform access once consent requirements are met, and I can resolve any consent-related access issues | Must Have | Yes | M |

## **2.3.4 Non-Functional Requirements**

| ID | Requirement | Category | MoSCoW | V1 Build | Effort |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **USABILITY & ACCESSIBILITY** |  |  |  |  |  |
| NFR-1 | The platform must be responsive on PC, tablet, and phone so that users can access from any device | Usability | Must Have | Yes | L |
| NFR-2 | The web-app platform must support web and mobile application access | Usability | Must Have | Yes | XS |
| NFR-3 | The platform must follow mobile-first progressive enhancement, optimising for budget devices (lower CPU, limited RAM, high-latency mobile data) so that it remains performant and non-exclusionary | Accessibility | Should Have | Yes | XL |
| NFR-4 | The platform will support full keyboard-only navigation to support users with motor impairments and screen-reader compatibility | Accessibility | Could Have | Yes | L |
| NFR-5 | The platform must target WCAG 2.1 AA standards as a baseline for all digital artifacts | Accessibility | Must Have | Yes | L |
| NFR-6 | The platform will use semantic HTML structures to ensure robust screen reader support for CV management and privacy toggles | Accessibility | Could Have | Yes | L |
| NFR-7 | The platform will optimise for low-bandwidth scenarios (limited data plans, older hardware) so that it remains accessible to all students | Accessibility | Could Have | Yes | L |
| NFR-8 | The platform must supportuse clear, gender-neutral language optimised for ESL(English as a Second Language) users in all system prompts and instructions | Accessibility | Must Have | Yes | XS |
| **SECURITY & COMPLIANCE** |  |  |  |  |  |
| NFR-9 | The platform must encrypt all data in transit (TLS 1.3) and at rest (AES-256) so that student data remains secure | Security | Must Have | Yes | XL |
| NFR-10 | CV uploads must be virus-scanned before storage so that malicious files don't compromise the system | Security | Could Have | No |  |
| NFR-11 | The platform must comply with GDPR, UK Data Protection Act 2018, and any UCL-specific data handling policies | Compliance | Must Have | No |  |
| **PERFORMANCE & SCALABILITY** |  |  |  |  |  |
| NFR-12 | The platform should target (pending SA input) must scale to supporting 1,000 \+ students and 100+ companies with concurrent access | Performance | Should Have | Yes | L |
| NFR-13 | The platform must integrate with UCL SSO and identity management systems | Integration | Must Have | Yes | S |

## 

## 

## 

## **2.3.5 Explicitly Out of Scope (Won't Have)**

**Validated with Client:**

* Native mobile applications (iOS/Android) \- responsive web is sufficient  
* Direct ATS integration for company partners (CSV export only)  
* Payment processing for premium features or subscription tiers (managed by UCL Finance via separate components)  
* Student mentorship, networking, or peer referral features  
* Alumni network or long-term career tracking post-graduation  
* Events management (career fairs, company presentations)  
* Automated CV parsing and skill extraction via NLP (manual profile completion acceptable for v1)  
* Integration with external job boards (LinkedIn, Indeed)  
* Video CV uploads or multimedia portfolios beyond static documents

## **2.4 Use Cases**

Use cases capture the interactions between actors (users) and the system, defining specific goals that result in observable value. Each use case represents a complete unit of testable functionality.

## **2.4.1 Primary Actors and Use Cases**

| Actor | Use Cases |
| :---- | :---- |
| **Student** | UC-1: Register/Create Account (Via UCL SSO) UC-2: Manage CV (Upload/Update/Delete CV) UC-3: Update Profile Information (Skills, Link External Profiles) UC-4: Configure Consent Settings UC-5: Whitelist/Blacklist Companies UC-6: View CV Access History UC-7: Respond to Recruiter Contact UC-8: Rate Company Interaction UC-9: Delete Account UC-10: View Job Opportunities |
| **Recruiter** | UC-11: Register Company Account UC-12: Manage Team Members (For Recruiter Lead)  UC-13: Search Student Profiles UC-14: View Anonymized Profile Previews UC-15: Apply Advanced Filters UC-16: Save Favourite Candidates UC-17: Contact Student (via Email/Platform) UC-18: Export Candidate List UC-19: Manage Recruitment Pipeline UC-20: Post Job Opportunity |
| **Strategic Alliances Team** | UC-21: Approve/Reject Company Registration UC-22: Suspend/Ban User Account UC-23: Manage Student Consent Workflows UC-24: View Platform Analytics UC-25: Generate Partnership ROI Report |
| **System** | UC-26: Log CV Access Event (Audit Log) UC-27: Send Notification (CV viewed, contact request) UC-28: Virus Scan Uploaded CV UC-29: Authenticate via UCL SSO/2FA |

## **2.4.2 Use Case Diagram**

*Use case diagram represents the complete project scope across all MoSCoW priority levels (P0-P2).*  
![][image2]

## 

## 

## **3\. Constraints, Assumptions & Known Dependencies**

## **3.1 Infrastructure Constraints**

**Validated:**

* The UCL IXN platform for reusable components exists.  
* Web hosting infrastructure is available.  
* Database infrastructure does NOT currently exist and requires procurement.  
* Target devices: PC, tablet, phone (responsive web; no native apps required).  
* An existing TypeScript placeholder exists for integration into the broader Strategic Alliances platform.  
* SSO integration with UCL identity systems (Shibboleth/SAML) is required for student authentication.

**To Be Validated:**

* Data Privacy, GDPR and UK Data Protection Act 2018 compliance.

## **3.2 Technical Dependencies**

**Existing UCL Systems:**

* Potential integration with the UCL IXN platform for reusable components  
* IXN authentication, user management, and UI component availability under evaluation  
* UCL design system guidelines and component library access are under review.

## **3.3 Architecture Decision Dependencies**

**Option 1: Leverage Existing Next.js Framework**

* **Pros:** Build on existing architecture/systems/codebases; faster initial setup  
* **Cons:** Database setup required; constrained by existing technical decisions  
* **Dependencies:** Access to existing codebase; documentation of current architecture

**Option 2: Build a Standalone App**

* **Pros:** Greater architectural freedom; optimised for specific requirements  
* **Cons:** Future integration complexity; potential code modifications post-handover  
* **Integration Strategy:** (a) Code modifications post-handover or (b) SSO/Auth bridging to the existing platform  
* **Dependencies:** Decision on long-term integration priority for the Strategic Alliances Team

**Next Steps:** Validate architecture options with Dr Yun and the full team; provide a recommendation during the next meeting (ETA: 29-Jan’26)

## 

## 

## 

## **3.4 Known Risks & Mitigation Strategies**

| Description | Impact | Risk-Level | Mitigation Strategy |
| :---- | :---- | :---- | :---- |
| UCL SSO integration delays | High \- blocks student authentication | Low | Auth/SSO components can be reused from the existing codebase, which the team has access to. We will validate solution quality and additional development needed by 5-Feb. |
| Database set-up | High \- blocks development | Low | Process to be clarified via client and team discussions by 3-Feb. |
| GDPR compliance complexity | High \- legal/reputational risk | Low | UCL Legal & IT contacts identified from the wider Strategic Alliances team. Directionally, these topics will be handled by UCL IT post-handover, clarifying next steps to surface project impact with Dr Daniel Hajas, 29-Jan’26. |

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATkAAAKsCAYAAACXosqcAACAAElEQVR4XuydB/gU1dm3ScwbUzRq1Bh7wxpjVxQVKaLSBAEFFERRFBXFjiKKICIqXVERsGAv2LCL2LH3HqOxxbxqbK+JqV/my/2YZ3L+h+31zMxzX9deu3t2d3a2zG/OeWqryDAMI8W08gcMwzDShImcYRip5IQTTpBrEzmj7hx88MHRgQceKBeXnXfeucV9l5kzZ8a3H3zwQXntlVdeGQ0fPtx5VhS9/vrrcv3nP/852nzzzVs8Voynn346+vvf/x59+OGHUa9evaInnngiOu+88+SxoUOHxs8bO3ZsNGDAgPh+IS644AJ/qChHHXWUXJ955plyPWjQIPfhotx///3+kPFv/vd//1euTeSMhtCq1Xd/NQ7gddddN3rhhRein//859GCBQui9dZbT8Tlhz/8YfT9738/+uSTT+T5evBfdNFF0f/7f/9Pxrp16yZjG220UfSzn/0sWmmllaKllloq2mCDDeS6f//+0Q9+8IPo/fffF8H50Y9+FN1www1y/ctf/lK2r3zve9+Ta923f/3rXzL2u9/9Lrriiitk7IMPPojOP/98uf3ee+9FP/nJT6Itt9wy3taiRYvkNuNw2mmnRW3atIlWXHFFEd71118/Ov744+W5q6yyijyHz8lrlOWWW06ujzjiCLlefvnl4/3k9SNGjIg23njjeKx169Yiuvfdd1+07LLLytg222wj18Z/MZEzGooKydprrx3Nnj07OuWUU0TkOnbsGI0aNUpmS4jU448/Hr3yyivR0ksvHb8WkbvrrruiP/3pTyJyX331VbTvvvvKNufNmyfPefjhh6PPPvssfp8999xTxOmvf/1rdP3118tsbZ111om6d+8eb1dFDlGETz/9NDr33HNFWBTe8/DDD5fbZ511lhw4iM3KK68sY6NHj47f073PZ+KzILqI9tlnny0zzWeeeUZmpSNHjoxfoyI3bNgwuUaw77777ujtt9+Wz/nFF19EAwcOlG2++OKL0X777SfPQ7jbtWsntzlRGC0xkTMaymuvvSbXCBFLTA78N998U2Zod9xxh9xnnNkPwsRMjIMb9BqYWcE999wj22T2xTWv++c//xl988030b333ivP+fzzz+Xxr7/+OvrHP/4R/eY3v5HtKrr05TG2x/PYhu6rwgwO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>