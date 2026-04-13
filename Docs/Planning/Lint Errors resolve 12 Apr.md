  ---                                                                                                                       
  Lint Error Triage — Full Analysis                                                                                         
                                                                                                                            
  Error Breakdown by Source                                                                                                 
                                                                                                                            
  ┌───────────────────────────────────┬─────────────────┬─────────────────────────────────┬─────────────┬───────┬───────┐   
  │              Source               │ no-explicit-any │          react-hooks/*          │ unused-vars │ Other │ Total │   
  ├───────────────────────────────────┼─────────────────┼─────────────────────────────────┼─────────────┼───────┼───────┤   
  │ src/lib/mantis/ (vendored         │ ~79             │ ~24 (setState, immutability,    │ ~4          │ 0     │ ~107  │ 
  │ template)                         │                 │ refs)                           │             │       │       │
  ├───────────────────────────────────┼─────────────────┼─────────────────────────────────┼─────────────┼───────┼───────┤   
  │ Project code (your team)          │ ~57             │ 1                               │ ~14         │ 3     │ ~75   │
  ├───────────────────────────────────┼─────────────────┼─────────────────────────────────┼─────────────┼───────┼───────┤   
  │ route-unused.ts (dead files)      │ 2               │ 0                               │ 0           │ 0     │ 2     │ 
  └───────────────────────────────────┴─────────────────┴─────────────────────────────────┴─────────────┴───────┴───────┘   
                                                                                                                          
  The mantis library accounts for ~58% of all errors. These are from a vendored UI template — modifying them risks breaking 
  template internals and creates merge pain if the template is ever updated.
                                                                                                                            
  Real Bugs Found in Project Code                                                                                           
   
  1. import { get } from "node:http" in src/app/talent-discovery-standalone/student-skills-experience/page.tsx:16 —         
  accidental autocomplete import. Node's HTTP module should never be imported in a Next.js page. Unused but wastes bundle if
   it leaks to client.                                                                                                      
  2. SuspensionActionModal.tsx:42-47 — setState in useEffect to reset form state when modal opens. Not a crash risk, but  
  causes an extra render cycle on every modal open. Low severity for your deployment scope.                                 
  3. let appLabelFallback in access-denied/page.tsx:93 — should be const. Minor but indicates a variable that was meant to
  be reassigned and wasn't.                                                                                                 
                                                                                                                          
  Root Cause: The (session.user as any) Pattern (~35-40 hits)                                                               
                                                                                                                          
  This is the single biggest driver of lint errors in your project code. The existing mantis next-auth.d.ts only augments   
  Session with id/provider/token — it does not augment Session.user with the fields your auth flow actually adds: id,     
  roleKeys, membershipTierKey, membershipTierRank.                                                                          
                                                                                                                          
  Every page and API route that reads from session is forced to cast session.user as any to access these fields. A proper   
  type declaration file eliminates ~35-40 errors in one shot and makes the codebase actually type-safe at the auth boundary.
                                                                                                                            
  Remaining any Types After Auth Fix (~20 hits)                                                                             
   
  These fall into a few patterns:                                                                                           
  - API route request parsing: parseNullableNumber(value: any), req.json() results                                        
  - Form event handlers: (e: any) in onChange handlers in UserProfileForm.tsx, CreateUserForm.tsx                           
  - Prisma return type mapping: mapExperience(exp: any), mapProject(project: any) — could use Prisma's generated types
  - Recruiter search route: search params typed as any                                                                      
                                                                                                                            
  Unused Vars — Which Matter                                                                                                
                                                                                                                            
  Variable: get from node:http                                                                                              
  File: student-skills-experience/page.tsx                                                                                
  Verdict: Bug — accidental import, remove                                                                                  
  ────────────────────────────────────────                                                                                
  Variable: RecruiterRegistrationInput                                                                                      
  File: auth/register/route.ts                                                                                              
  Verdict: Import exists but type is used via @/types/index — just unused import, remove                                    
  ────────────────────────────────────────                                                                                  
  Variable: tabTitles                                                                                                       
  File: student-users/[id]/edit/page.tsx                                                                                    
  Verdict: Dead code — someone started tab titles and didn't finish, remove                                               
  ────────────────────────────────────────                                                                                  
  Variable: debugParams                                                                                                     
  File: access-denied/page.tsx                                                                                            
  Verdict: Intentionally kept for debug block (commented out JSX below). Keep — remove when debug block is removed          
  ────────────────────────────────────────                                                                                
  Variable: defaultAppTouched                                                                                               
  File: UserProfileForm.tsx                                                                                               
  Verdict: Dead state — was probably tracking a UI flag, never wired. Remove                                                
  ────────────────────────────────────────                                                                                  
  Variable: onOpenAction                                                                                                  
  File: UserManagementTable.tsx                                                                                             
  Verdict: Defined in Props but destructured and unused — it's in the component signature. This is likely a team member's 
  WIP                                                                                                                     
     for wiring action buttons. Flag but don't remove — it's an interface contract                                          
  ────────────────────────────────────────
  Variable: theme                                                                                                           
  File: CompanyAccessConsentCard.tsx                                                                                      
  Verdict: Unused useTheme() call, remove                                                                                   
  ────────────────────────────────────────                                                                                
  Variable: inputSx, additionalInfo, setAdditionalInfo
  File: StudentAcademicInformationForm.tsx
  Verdict: Dead styling/state vars, remove
  ────────────────────────────────────────
  Variable: Props
  File: StudentProjectSection.tsx
  Verdict: Type defined but component uses inline destructuring. Remove type
  ────────────────────────────────────────
  Variable: TagOutlinedIcon                                                                                                 
  File: StudentSideBar.tsx
  Verdict: Unused import, remove                                                                                            
  ────────────────────────────────────────                                                                                
  Variable: activeCount, suspendedCount, bannedCount                                                                        
  File: AdminPartnerManagementPage.tsx
  Verdict: Computed but never rendered — looks like summary card data that hasn't been wired to UI yet. Flag but don't      
  remove                                                                                                                  
     — these feed the metrics state pattern above them; someone likely plans to use them
  ────────────────────────────────────────
  Variable: className                                                                                                       
  File: mantis SubCard
  Verdict: Mantis code — excluded                                                                                           
  ────────────────────────────────────────                                                                                
  Variable: event, newExpanded                                                                                              
  File: mantis ControlledAccordion
  Verdict: Mantis code — excluded                                                                                           
                                                                                                                          
  ---
  Proposed Plan — 4 Phases
                                                                                                                            
  Phase 0: Shrink lint scope (config-only, zero code risk)
                                                                                                                            
  - Add src/lib/mantis/** to ESLint globalIgnores                                                                           
  - Delete or ignore route-unused.ts files (they're clearly dead)                                                           
  - Remove stale eslint-disable directive in AdminDataTable.tsx                                                             
  - Impact: Eliminates ~109 errors. No code changes to active features.                                                     
                                                                                                                            
  Phase 1: Type foundation — NextAuth augmentation                                                                          
                                                                                                                            
  - Create src/types/next-auth.d.ts augmenting Session["user"] and JWT with id, roleKeys, membershipTierKey,                
  membershipTierRank                                                                                                      
  - Remove (session.user as any) casts across all pages and API routes                                                      
  - Remove (token as any) casts in src/lib/auth.ts callbacks                                                              
  - Impact: Eliminates ~35-40 no-explicit-any errors. Makes auth boundary genuinely type-safe.                              
  - Risk: Low — just replacing unsafe casts with proper types. Need to verify the type augmentation is picked up by         
  tsconfig.json.                                                                                                            
                                                                                                                            
  Phase 2: Fix real bugs + safe warnings                                                                                    
                                                                                                                          
  - Remove import { get } from "node:http" (accidental import, potential bundle bloat)                                      
  - let → const for appLabelFallback in access-denied/page.tsx                                                            
  - Remove clearly dead vars: tabTitles, defaultAppTouched, theme (useTheme), inputSx, additionalInfo/setAdditionalInfo,    
  Props type, TagOutlinedIcon, unused RecruiterRegistrationInput import                                                     
  - Keep but comment onOpenAction and activeCount/suspendedCount/bannedCount — these look like WIP from team members. I'd
  prefix with _ to suppress the lint warning while preserving intent.                                                       
  - Impact: Eliminates ~14 warnings.                                                                                      
  - Risk: Very low — all removals are verified dead code. The "keep" items are flagged for team discussion.                 
                                                                                                                            
  Phase 3: Remaining any types in project code (~20 hits)
                                                                                                                            
  This phase requires more careful per-file analysis. I'd tackle:                                                           
  - API route helpers (parseNullableNumber, request body parsing) — type the params properly
  - Form event handlers in UserProfileForm.tsx and CreateUserForm.tsx — use React.ChangeEvent<HTMLInputElement> etc.        
  - mapExperience/mapProject helpers — use Prisma's generated types                                                       
  - Recruiter search route params                                                                                           
  - src/components/talent-discovery/student-components/StudentManageAccountPanel.tsx and StudentProfileSideCard.tsx         
  - Impact: Eliminates remaining ~20 no-explicit-any errors.                                                                
  - Risk: Medium — these touch form logic and API routes across multiple team members' code. Each needs individual          
  verification.                                                                                                             
                                                                                                                            
  Phase 4: Low-priority warnings (defer or discuss)                                                                         
                                                                                                                            
  - <img> → <Image /> in Header.tsx — functional but affects LCP optimization. Worth doing but not a lint-fail.             
  - SuspensionActionModal.tsx setState-in-effect — working correctly, just an extra render. Could refactor to use key prop
  pattern but low ROI for your deployment scope.                                                                            
                                                                                                                          
  ---                                                                                                                       
  Recommended scope for this PR                                                                                           
                                                                                                                            
  I'd suggest Phases 0–2 in this PR. They're safe, high-impact, and don't touch other team members' feature logic. That
  takes you from ~184 errors/warnings down to ~20, all of which are in Phase 3 (per-file any typing that can be a           
  follow-up).      