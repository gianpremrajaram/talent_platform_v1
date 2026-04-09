# Accessibility Evaluation
**UCL CS Alliances — Talent Platform V1**
**Scope:** Talent Discovery + Membership Dashboard
**Date:** 2026-04-09
**Status:** Draft for internal review

---

## 1. Purpose and Scope

This evaluation reviews the front-end implementation of the Talent Discovery and Membership Dashboard applications for accessibility risk. It was commissioned following client feedback that the platform's reliance on Mantis UI (MUI) components introduced screen-reader compatibility issues.

The directional response is not to move away from MUI, but to use it more deliberately — leveraging its accessibility props where they exist, supplementing where they do not, and applying CSS-level corrections to ensure keyboard and assistive-technology users have a consistent experience.

This document covers:
- `src/app/(shell)/talent-discovery/` and all child components
- `/talent-discovery-standalone/` student portal (sidebar, profile forms, CV library, consent)
- `src/app/(shell)/membership-dashboard/` and all child components
- Shared layout: `ClientLayout`, `Header`, `Footer`, `globals.css`

Pages not covered in this round but sharing the same layout architecture (and therefore inheriting the same layout-level risks): `/ixn-workflow-manager`, public-facing service pages, `/sign-in`, `/register`.

---

## 2. What Is Working

Before identifying risks, it is worth noting the areas that are already implemented correctly. These represent a foundation to build on rather than areas requiring change.

| Pattern | Location | Status |
|---|---|---|
| Skip-to-content link | `ClientLayout.tsx:18`, `globals.css:104–117` | Correctly implemented — hidden offscreen, appears on focus |
| `.sr-only` utility class | `globals.css:92–102` | Correct implementation; used in `BenefitsFilterToolbar` |
| Keyboard Escape closes nav menus | `Header.tsx:57–67` | Correctly implemented |
| Nav dropdown ARIA attributes | `Header.tsx:120–168` | `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-labelledby` all present and correct |
| `aria-current="page"` on active nav link | `Header.tsx:112` | Correctly implemented |
| Error messages use `role="alert"` | `PartnerFullView.tsx:258`, `RegisterForm.tsx:251` | Correct — screen readers announce errors on submission |
| Admin tab panel `aria-labelledby` | `AdminDashboardClient.tsx:200–237` | Tab/panel relationships correctly wired |
| `aria-pressed` on filter toggle buttons | `BenefitsFilterToolbar.tsx:25, 36, 47` | Correct toggle button pattern |
| Form labels with `htmlFor`/`id` | `RegisterForm.tsx`, `PartnerFullView.tsx` (search panel) | Proper label association in both forms |
| `details`/`summary` in member list | `AdminDashboardClient.tsx:252` | Native, keyboard-accessible disclosure |
| Responsive `nav-root` wrapping | `globals.css:328–331` | Nav wraps at 900px on small screens |

---

## 3. Risk Summary

Issues are grouped into five risk areas. Severity is assessed by user impact: **Critical** means a screen reader or keyboard user cannot complete a task at all; **High** means significant friction or incorrect announcements; **Medium** means degraded experience; **Low** means polish items.

### 3.1 Screen Reader — Critical Gaps

**Focus outline removal in CSS (Critical)**
The `.button-link:focus`, `.btn:focus`, and `.pill:focus` rules all set `outline: 2px solid transparent`. This removes the visible focus ring for keyboard users. While a background-colour change is applied on focus, this does not survive Windows High Contrast mode (forced-colors), where CSS colour changes are ignored. The result is a completely invisible focus indicator for high-contrast keyboard users across all primary action buttons and navigation pills in both apps.

**Icon-only buttons with no accessible name (Critical)**
The Notifications and Settings icon buttons in the Student portal top bar (`StudentTopNavBar.tsx:50–58`) have no `aria-label`. Screen readers announce them only as "button" with no indication of purpose. The delete icon button in `StudentCVLibraryCard.tsx:174–184` is wrapped in an MUI `Tooltip` — but MUI Tooltip is mouse-triggered only by default; keyboard users focusing the button receive no accessible name, since the tooltip does not render. Wrapping in a Tooltip is not a substitute for `aria-label`.

**Clickable `<div>` elements in Student profile sidebar card (Critical)**
`StudentProfileSideCard.tsx:184–218` renders navigation menu items as `<Box component={item.href ? "a" : "div"}>`. When an `onClick` handler is provided without an `href`, the element renders as a `<div>`. A `<div>` is not keyboard-reachable by default (no tab stop), not activatable by Enter or Space, and carries no semantic role. Keyboard-only users cannot interact with these items at all.

**Form fields missing programmatic label association in Student profile (Critical)**
`StudentPersonalInfoForm.tsx` uses `<Typography>` as a visual label above each `<TextField>`. Because Typography and TextField are separate elements with no `htmlFor`/`id` link, there is no programmatic label association. Screen readers announce the field as an unlabelled input. This applies to all ~14 fields: First Name, Last Name, Email, Date of Birth, Gender, Phone Code, Phone Number, Designation, and all address fields. The MUI DatePicker (line 598) shares this issue.

---

### 3.2 Screen Reader — MUI Component Risks

**Unlabelled MUI TextField select controls in Job Board (High)**
`JobOpeningsTable.tsx:293–331` contains three `TextField` inputs (Search, Status filter, Sort by) with no `label` prop — only `placeholder`. MUI renders a `<label>` only when the `label` prop is supplied. Without it, the placeholder disappears on focus and nothing describes the field to a screen reader. All three controls are affected.

**Decorative MUI icons not marked aria-hidden (High)**
Several places render MUI icon components alongside visible text labels without marking the icon as decorative:
- `JobOpeningsTable.tsx:263–267` — `CheckCircleOutlineIcon` and `HighlightOffOutlinedIcon` next to "Applied"/"Not Applied" text. Screen readers announce the icon SVG title *and* the text: "check circle outline Applied".
- `AdminSidebar.tsx:136` — Navigation icons inside `ListItemButton` next to text labels. Some browsers expose icon SVGs to the accessibility tree.
- `StudentProfileSideCard.tsx:206–215` — Icon within each menu item renders without `aria-hidden`.

**Emoji without aria-hidden used as state indicators (High)**
`MemberDashboard.tsx:179–193` renders benefit state as raw emoji: `🔒`, `✅`, `🟡`. These are announced in full by screen readers ("lock", "check mark button", "yellow circle") rather than conveying "locked", "redeemed", or "available". `BenefitsFilterToolbar.tsx:28` has a similar pattern — the emoji is not aria-hidden, while a `.sr-only` span repeats the same text, causing double-announcement.

**MUI DataGrid accessibility configuration absent (High)**
`JobOpeningsTable.tsx:336–366` uses `DataGrid` with no `aria-label` or `ariaLabel` prop, no `getRowAriaLabel`, and custom `renderCell` renderers that contain icon components (see above). MUI DataGrid has keyboard navigation built in (arrow keys within the grid), but without an accessible grid label, screen readers have no way to identify what the table represents on announcement.

**Tab panels missing `aria-labelledby` in Partner view (High)**
`PartnerFullView.tsx:340–356` implements a tab bar — `role="tablist"`, `role="tab"`, `aria-selected` — but the tab buttons have no `id` attribute. The `role="tabpanel"` divs (lines 360, 369) have no `aria-labelledby` pointing back to the controlling tab. This breaks the ARIA tab pattern: screen readers cannot announce which tab a panel belongs to.

---

### 3.3 Keyboard Navigation

**No arrow-key navigation in tab bars (High)**
Both tab implementations — `AdminDashboardClient.tsx:200–237` and `PartnerFullView.tsx:330–356` — respond only to mouse click and Escape. The ARIA tab pattern (WCAG 4.1.2) specifies that Tab moves focus into the tablist, and Left/Right arrows move between tabs. Without this, keyboard users must Tab through every tab to reach the next one, and the arrow-key convention expected by screen readers is not met.

**`role="menubar"` without arrow-key navigation (High)**
`Header.tsx:105` assigns `role="menubar"` to the navigation list. The ARIA menubar pattern requires arrow keys to navigate between top-level items and into submenus. Only Escape (closes open menus) is currently handled. Keyboard users relying on the menubar pattern will find it non-functional.

**Redundant ARIA attributes (Low)**
`SecondaryNav.tsx:14–52` applies both `aria-disabled="true"` and `disabled` to each button — these are redundant since `disabled` is sufficient and natively communicated. `ClientLayout.tsx:27` applies `role="main"` to `<main>` — redundant since `<main>` is already a landmark. `Header.tsx:70` applies `role="banner"` to `<header>` — same issue. These are harmless but create noise in the accessibility tree; they should be removed to avoid generated-ARIA antipattern reputation.

---

### 3.4 Mobile Rendering

**Fixed-width sidebars with no mobile breakpoints (Critical on mobile)**
Both `AdminSidebar.tsx:164–173` (Membership Dashboard) and `StudentSideBar.tsx:137–147` (Student portal) have `width: 280` and `height: "100vh"` as fixed MUI `sx` values with no responsive variants. Their parent layout wrappers — `membership-dashboard/layout.tsx:9` and the student portal layout — both use `display: flex` with no `flexDirection` breakpoint. On screens narrower than ~600px, the 280px sidebar forces the content area into a strip, causing severe horizontal overflow and content cut-off. This affects every page in both apps.

**Touch targets below recommended minimum (Medium)**
`.pill` buttons (`globals.css:770–783`) have `padding: 0.45rem 0.9rem`. At base font size (16px), this yields approximately 23px × 40px effective hit areas — below the WCAG 2.5.5 recommendation of 44×44px. These pills appear in `SecondaryNav` and on the home page. On touch devices, activating them reliably is difficult for users with motor impairments.

**Hardcoded colour values that bypass MUI theme (Medium)**
Several components use hardcoded hex values: `AdminSidebar.tsx:207` (`#f4c26b` avatar background), `StudentProfileSideCard.tsx:49–59` (social link backgrounds: `#0A66C2`, `#1877F2`, `#171515`, `#000000`), `RegisterForm.tsx:127` (`#2563eb` SSO button). These values are not responsive to the dark mode tokens defined in `globals.css:47–60` and have not been validated for WCAG AA contrast (4.5:1 for normal text). The GitHub background (`#171515`) with white text passes marginally (≈ 18.7:1), but the contrast in dark mode has not been tested.

---

### 3.5 Semantic Structure

**Sidebar elements missing landmark roles (Medium)**
`AdminSidebar.tsx` and `StudentSideBar.tsx` render as `<Box>` (div). Users navigating by landmarks (a common screen reader technique) have no way to jump directly to the navigation. Both should be `<nav aria-label="...">`. The content area in the dashboard layouts should be `<main>` rather than a plain `<div>`.

**Social link aria-labels too generic (Medium)**
`StudentProfileSideCard.tsx:147` sets `aria-label={item.platform}` — for example, "twitter" or "linkedin". This announces as "twitter, link" which gives no destination or intent. Should read "Visit [Name]'s LinkedIn profile" or at minimum "LinkedIn (opens in new tab)".

**Emoji as location marker without aria-hidden (Low)**
`PartnerFullView.tsx:57` renders `📍 {student.location}` with the pin emoji inline. Screen readers announce "round pushpin London" which is understandable but not ideal. Marking the emoji `aria-hidden="true"` gives "London" alone, which is cleaner.

---

## 4. Blast Radius — Shared Layout Inheritance

The table below maps issues to the pages they affect, beyond the components where they originate.

| Issue | Origin | Also Affects |
|---|---|---|
| Fixed sidebar, no mobile stacking | `AdminSidebar`, `StudentSideBar` | Every page under `/membership-dashboard` and `/talent-discovery-standalone` |
| Focus ring removal | `globals.css` (`.button-link`, `.btn`, `.pill`) | All button-link and pill instances site-wide: benefits pages, partner search, secondary nav, register, sign-in |
| `role="menubar"` without arrow keys | `Header.tsx` | All pages — Header is global |
| `role="main"` + `role="banner"` redundancy | `ClientLayout.tsx`, `Header.tsx` | All pages |
| Student form label disconnect | `StudentPersonalInfoForm.tsx` | `/talent-discovery-standalone/student-personal-information` |
| DataGrid accessibility | `JobOpeningsTable.tsx` | `/talent-discovery-standalone/student-dashboard` |
| Tab pattern (no arrow keys, no `aria-labelledby`) | `PartnerFullView.tsx` | `/talent-discovery` partner view |
| Icon-only buttons | `StudentTopNavBar.tsx` | All pages in student portal (top bar is persistent) |
| Emoji state indicators | `MemberDashboard.tsx`, `BenefitsFilterToolbar.tsx` | `/membership-dashboard` member view and admin view |

---

## 5. Recommended Priorities

These are ordered by user impact, not implementation complexity.

1. **Mobile sidebar stacking** — affects all users on phones; single change per sidebar with MUI responsive sx
2. **Focus ring CSS** — affects all keyboard users site-wide; targeted CSS change in `globals.css`
3. **Icon-only button labels** — student portal top bar is persistent; one-line fix per button
4. **Student form label association** — 14 unlabelled fields affecting the core profile flow
5. **Clickable div in StudentProfileSideCard** — convert to `<button>` or add `tabIndex` + keyboard handler
6. **Tab pattern keyboard navigation** — affects admin dashboard and partner view
7. **DataGrid and PartnerFullView tab `aria-labelledby`** — targeted ARIA prop additions
8. **Emoji aria-hidden** — quick, low-risk cleanup across MemberDashboard and PartnerFullView
9. **Sidebar landmark roles** — semantic `<nav>` wrapping both sidebars
10. **Social link aria-label copy** — text change only

---

## Appendix A — Implementation Detail

This appendix is intended for developers. Each item references the specific file, line(s), the issue as it appears in code, and the recommended change.

---

### A1. Focus Ring — `globals.css` (affects all button-like elements)

**File:** `src/app/globals.css`

**Issue:** `.button-link:focus`, `.btn:focus`, and `.pill:focus` all set `outline: 2px solid transparent`. This removes the native browser focus ring entirely. The colour change alone (background goes to `--ucl-blue`) is not sufficient for forced-colours/high-contrast mode.

**Current (lines 509–516, 472–478, 785–790):**
```css
.button-link:hover,
.button-link:focus {
  background: var(--ucl-blue);
  color: #fff;
  text-decoration: none;
  outline: 2px solid transparent;  /* ← removes focus ring */
  outline-offset: 2px;
}
```

**Fix:** Replace `:focus` with `:focus-visible` and use a real outline that survives forced-colors:
```css
.button-link:hover {
  background: var(--ucl-blue);
  color: #fff;
  text-decoration: none;
}
.button-link:focus-visible {
  background: var(--ucl-blue);
  color: #fff;
  text-decoration: none;
  outline: 3px solid var(--focus);       /* --focus: #005bbb defined in :root */
  outline-offset: 2px;
}
```
Apply the same pattern to `.btn:focus` → `.btn:focus-visible` and `.pill:focus` → `.pill:focus-visible`.

Also add to `globals.css` a forced-colors override so the outline is always visible in Windows High Contrast:
```css
@media (forced-colors: active) {
  .button-link:focus-visible,
  .btn:focus-visible,
  .pill:focus-visible {
    outline: 3px solid ButtonText;
  }
}
```

---

### A2. Icon-Only Buttons — `StudentTopNavBar.tsx`

**File:** `src/components/talent-discovery/student-components/StudentTopNavBar.tsx`

**Issue (lines 50–64):** Two `IconButton` components have no accessible name. The Avatar (line 60) uses `alt="User"` — too generic for a profile image.

**Current:**
```tsx
<IconButton color="inherit">
  <Badge badgeContent={9} color="primary">
    <NotificationsNoneOutlinedIcon />
  </Badge>
</IconButton>

<IconButton color="inherit">
  <SettingsOutlinedIcon />
</IconButton>

<Avatar
  alt="User"
  src="/images/avatar/avatar-1.png"
  sx={{ width: 40, height: 40, ml: 1 }}
/>
```

**Fix:**
```tsx
<IconButton color="inherit" aria-label="Notifications — 9 unread">
  <Badge badgeContent={9} color="primary" aria-hidden="true">
    <NotificationsNoneOutlinedIcon aria-hidden="true" />
  </Badge>
</IconButton>

<IconButton color="inherit" aria-label="Settings">
  <SettingsOutlinedIcon aria-hidden="true" />
</IconButton>

<Avatar
  alt="Your profile"   {/* or pass the real user name from session */}
  src="/images/avatar/avatar-1.png"
  sx={{ width: 40, height: 40, ml: 1 }}
/>
```

When the notification count is dynamic, build the label string from state: `` aria-label={`Notifications — ${count} unread`} ``.

---

### A3. Delete Button in CV Card — `StudentCVLibraryCard.tsx`

**File:** `src/components/talent-discovery/student-components/StudentCVLibraryCard.tsx`

**Issue (lines 174–184):** MUI `Tooltip` does not expose its title to keyboard users as an accessible name. The `IconButton` has no `aria-label`.

**Current:**
```tsx
<Tooltip title="Delete CV">
  <IconButton
    onClick={() => setConfirmOpen(true)}
    sx={{ color: "error.main", ... }}
  >
    <DeleteOutlineIcon />
  </IconButton>
</Tooltip>
```

**Fix:** Add `aria-label` directly to the `IconButton` and mark the icon decorative. The Tooltip can remain for mouse users.
```tsx
<Tooltip title="Delete CV">
  <IconButton
    aria-label={`Delete CV: ${title}`}  {/* title prop is the CV name */}
    onClick={() => setConfirmOpen(true)}
    sx={{ color: "error.main", ... }}
  >
    <DeleteOutlineIcon aria-hidden="true" />
  </IconButton>
</Tooltip>
```

---

### A4. Clickable `<div>` Menu Items — `StudentProfileSideCard.tsx`

**File:** `src/components/talent-discovery/student-components/StudentProfileSideCard.tsx`

**Issue (lines 184–218):** When `item.onClick` is set and `item.href` is undefined, `component={item.href ? "a" : "div"}` renders a `<div>` with an `onClick`. A `<div>` has no tab stop and is not keyboard activatable.

**Current:**
```tsx
<Box
  key={`${item.label}-${index}`}
  component={item.href ? "a" : "div"}
  href={item.href}
  onClick={item.onClick}
  sx={{ cursor: item.onClick || item.href ? "pointer" : "default", ... }}
>
```

**Fix:** Use `"button"` as the fallback component instead of `"div"`:
```tsx
<Box
  key={`${item.label}-${index}`}
  component={item.href ? "a" : item.onClick ? "button" : "div"}
  href={item.href}
  onClick={item.onClick}
  type={item.onClick && !item.href ? "button" : undefined}
  sx={{ cursor: item.onClick || item.href ? "pointer" : "default", ... }}
>
```

Additionally, mark the icon decorative (line 206–215):
```tsx
<Box sx={{ color: ..., display: "flex", alignItems: "center" }}>
  {/* Clone icon with aria-hidden — or ensure all MenuItem icons are passed with aria-hidden="true" */}
  {React.isValidElement(item.icon)
    ? React.cloneElement(item.icon as React.ReactElement, { "aria-hidden": true })
    : item.icon}
</Box>
```

---

### A5. Social Link `aria-label` — `StudentProfileSideCard.tsx`

**File:** `src/components/talent-discovery/student-components/StudentProfileSideCard.tsx`

**Issue (line 147):** `aria-label={item.platform}` gives only the platform name with no intent or context.

**Current:**
```tsx
<IconButton
  aria-label={item.platform}
  ...
>
```

**Fix:**
```tsx
const socialLabels: Record<SocialLink["platform"], string> = {
  linkedin: "LinkedIn profile (opens in new tab)",
  twitter: "Twitter / X profile (opens in new tab)",
  facebook: "Facebook profile (opens in new tab)",
  github: "GitHub profile (opens in new tab)",
};

// In JSX:
<IconButton
  aria-label={socialLabels[item.platform]}
  ...
>
  <SocialIcon platform={item.platform} aria-hidden />
</IconButton>
```

Also mark `SocialIcon` icons with `aria-hidden` (they already receive `fontSize="small"` — just add `aria-hidden={true}` to each MUI icon in the `SocialIcon` function).

---

### A6. Student Personal Info Form — Label Association

**File:** `src/components/talent-discovery/student-components/StudentPersonalInfoForm.tsx`

**Issue (lines 555–675):** All fields use a `<Typography>` label visually placed above a `<TextField>` with no programmatic association. MUI TextField does have a built-in `label` prop that creates an accessible `<label>` — it should be used instead of the external Typography.

**Current pattern (First Name, repeated for all fields):**
```tsx
<Grid size={{ xs: 12, md: 6 }}>
  <Typography sx={labelSx}>First Name</Typography>
  <TextField
    fullWidth
    value={values.firstName}
    onChange={handleChange("firstName")}
    error={!!errors.firstName}
    helperText={errors.firstName}
    disabled={!isEditingPersonal}
    sx={isEditingPersonal ? inputSx : readOnlySx}
  />
</Grid>
```

**Fix:** Remove the `<Typography>` label and use the TextField `label` prop. MUI handles the label positioning internally:
```tsx
<Grid size={{ xs: 12, md: 6 }}>
  <TextField
    fullWidth
    label="First Name"
    value={values.firstName}
    onChange={handleChange("firstName")}
    error={!!errors.firstName}
    helperText={errors.firstName}
    disabled={!isEditingPersonal}
    sx={isEditingPersonal ? inputSx : readOnlySx}
  />
</Grid>
```

Apply the same pattern to: Last Name, Email Address, Gender (select), Phone Code (select), Phone Number, Designation, Address Line 1, Address Line 2, Country, State/Province, City, Postal Code.

For the **DatePicker** (lines 598–612), use `slotProps.textField.label`:
```tsx
<DatePicker
  value={values.dateOfBirth}
  onChange={handleDateChange}
  disabled={!isEditingPersonal}
  disableFuture
  format="DD/MM/YYYY"
  slotProps={{
    textField: {
      fullWidth: true,
      label: "Date of Birth",   {/* ← add this */}
      error: !!errors.dateOfBirth,
      helperText: errors.dateOfBirth,
      sx: isEditingPersonal ? inputSx : readOnlySx,
    },
  }}
/>
```

**Note on visual styling:** When MUI TextField has a `label` prop, by default it floats above the input border in MUI's outlined variant. If the current visual appearance (static label above the box) is preferred by design, use `InputLabelProps={{ shrink: true }}` and style `.MuiInputLabel-root` in the theme or `sx` to match the current `labelSx` positioning. The programmatic association is what matters — the visual position can be adjusted independently.

---

### A7. Job Board Search / Filter Labels — `JobOpeningsTable.tsx`

**File:** `src/components/talent-discovery/student-components/JobOpeningsTable.tsx`

**Issue (lines 293–331):** Three `TextField` components (search, status filter, sort) use only `placeholder` with no `label` prop.

**Fix:**
```tsx
{/* Search field */}
<TextField
  label="Search jobs"
  placeholder="Search by company or job title"
  size="small"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  sx={{ minWidth: 280 }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon fontSize="small" aria-hidden="true" />
      </InputAdornment>
    ),
  }}
/>

{/* Status filter */}
<TextField
  select
  label="Application status"
  size="small"
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  sx={{ minWidth: 140 }}
>
  ...
</TextField>

{/* Sort */}
<TextField
  select
  label="Sort by"
  size="small"
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
  sx={{ minWidth: 140 }}
>
  ...
</TextField>
```

Also add an `aria-label` to the DataGrid itself:
```tsx
<DataGrid
  rows={filteredRows}
  columns={columns}
  aria-label="Job openings"
  ...
/>
```

And mark decorative icons in cells as `aria-hidden`:
```tsx
{/* Status cell — lines 255–270 */}
{params.row.status === "Applied" ? (
  <CheckCircleOutlineIcon fontSize="small" color="success" aria-hidden="true" />
) : (
  <HighlightOffOutlinedIcon fontSize="small" color="error" aria-hidden="true" />
)}

{/* Company avatar icon — line 191 */}
<Avatar sx={{ width: 30, height: 30 }} aria-hidden="true">
  <GoogleIcon />
</Avatar>
```

---

### A8. Tab Pattern — `PartnerFullView.tsx`

**File:** `src/components/talent-discovery/PartnerFullView.tsx`

**Issue (lines 332–383):** Tab buttons have no `id` attribute; tab panels have no `aria-labelledby`. Arrow-key navigation is not implemented.

**Fix:**
```tsx
{/* Tab bar — add ids to buttons */}
<div role="tablist" style={{ ... }}>
  <button
    id="tab-job-board"
    role="tab"
    aria-selected={activeTab === "job-board"}
    aria-controls="panel-job-board"
    tabIndex={activeTab === "job-board" ? 0 : -1}
    style={tabStyle("job-board")}
    onClick={() => setActiveTab("job-board")}
    onKeyDown={handleTabKeyDown}
  >
    Job Board
  </button>
  <button
    id="tab-student-search"
    role="tab"
    aria-selected={activeTab === "student-search"}
    aria-controls="panel-student-search"
    tabIndex={activeTab === "student-search" ? 0 : -1}
    style={tabStyle("student-search")}
    onClick={() => setActiveTab("student-search")}
    onKeyDown={handleTabKeyDown}
  >
    Student Search
  </button>
</div>

{/* Tab panels — add id and aria-labelledby */}
{activeTab === "job-board" && (
  <div role="tabpanel" id="panel-job-board" aria-labelledby="tab-job-board">
    ...
  </div>
)}
{activeTab === "student-search" && (
  <div role="tabpanel" id="panel-student-search" aria-labelledby="tab-student-search">
    ...
  </div>
)}
```

Add the arrow-key handler (same pattern should be applied to `AdminDashboardClient.tsx`):
```tsx
const tabs: Tab[] = ["job-board", "student-search"];

function handleTabKeyDown(e: React.KeyboardEvent) {
  const currentIndex = tabs.indexOf(activeTab);
  if (e.key === "ArrowRight") {
    const next = tabs[(currentIndex + 1) % tabs.length];
    setActiveTab(next);
  } else if (e.key === "ArrowLeft") {
    const prev = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
    setActiveTab(prev);
  } else if (e.key === "Home") {
    setActiveTab(tabs[0]);
  } else if (e.key === "End") {
    setActiveTab(tabs[tabs.length - 1]);
  }
}
```

Note: using `tabIndex={-1}` on inactive tabs and `tabIndex={0}` on the active tab (the "roving tabindex" pattern) is required alongside arrow keys, so Tab moves into the tablist once and then exits, while arrows move within it.

---

### A9. Mobile Sidebar Responsiveness

**Files:**
- `src/components/membership-dashboard/AdminSidebar.tsx` (lines 164–173)
- `src/components/talent-discovery/student-components/StudentSideBar.tsx` (lines 138–147)
- `src/app/(shell)/membership-dashboard/layout.tsx` (lines 8–16)

**Issue:** Fixed `width: 280`, `height: "100vh"` in both sidebars, parent layouts use non-responsive flex.

**Fix — AdminSidebar.tsx:**
```tsx
<Box
  component="nav"
  aria-label="Membership navigation"
  sx={{
    width: { xs: "100%", md: 280 },
    height: { xs: "auto", md: "100vh" },
    borderRight: { xs: "none", md: "1px solid" },
    borderBottom: { xs: "1px solid", md: "none" },
    borderColor: "divider",
    bgcolor: "background.paper",
    overflowY: "auto",
    flexShrink: 0,
  }}
>
```

**Fix — membership-dashboard/layout.tsx:**
```tsx
<div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
  {/* Mobile: column; desktop: row — handle via MUI Box or media query */}
  <AdminSidebar />
  <main style={{ flexGrow: 1, padding: "1.5rem", minWidth: 0 }}>
    {children}
  </main>
</div>
```
Or using MUI Box for responsive direction:
```tsx
<Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh" }}>
  <AdminSidebar />
  <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
    {children}
  </Box>
</Box>
```

Apply the same responsive `sx` pattern to `StudentSideBar.tsx` and its parent layout.

**Note:** The `<main>` wrapper in the layout is important — it provides the `main` landmark for the inner content, which is distinct from the outer `<main>` in `ClientLayout`. Nested `<main>` is not valid HTML; instead the layout should use `<div>` at the outer level and promote the inner content area to `<main>`. Review whether `ClientLayout.tsx`'s `<main>` and the dashboard's layout `<div>` need to be restructured to avoid nesting issues.

---

### A10. Emoji State Indicators — `MemberDashboard.tsx` + `BenefitsFilterToolbar.tsx`

**File:** `src/components/membership-dashboard/MemberDashboard.tsx`

**Issue (lines 100–110):** `symbol` is a raw emoji (`🔒`, `✅`, `🟡`) rendered as `{symbol}` in a `<span>`. Screen readers announce the full emoji name.

**Fix:**
```tsx
<span className="benefit-state" aria-hidden="true">{symbol}</span>
```
This hides the emoji from the accessibility tree. The benefit state is already conveyed by the filter toolbar's aria-pressed state and by the benefit link label itself.

**File:** `src/components/membership-dashboard/BenefitsFilterToolbar.tsx`

**Issue (lines 27–29):** Emoji is not aria-hidden, and the label text is duplicated between an `sr-only` span and an `aria-hidden` span.

**Current:**
```tsx
✅ <span className="sr-only">Redeemed</span>
<span aria-hidden="true">Redeemed</span> ({counts.redeemed})
```

**Fix:** The emoji should be aria-hidden; only one text label is needed:
```tsx
<span aria-hidden="true">✅</span>
{" "}Redeemed ({counts.redeemed})
```
This announces "Redeemed (3)" — clean and unambiguous. The `aria-pressed` state on the button already conveys whether it is active.

Apply the same pattern to the `🟡` and `🔒` buttons.

---

### A11. Redundant ARIA — `ClientLayout.tsx`, `Header.tsx`, `SecondaryNav.tsx`

**File:** `src/components/ClientLayout.tsx`

Remove redundant `role="main"` (line 27):
```tsx
<main id="main" className={...}>
  {children}
</main>
```

**File:** `src/components/Header.tsx`

Remove redundant `role="banner"` (line 70):
```tsx
<header className="banner">
```

**File:** `src/components/membership-dashboard/SecondaryNav.tsx`

Remove `aria-disabled="true"` from buttons that also have `disabled` (lines 14–52). The `disabled` attribute is sufficient:
```tsx
<button
  type="button"
  className="pill"
  disabled
  title="This action will be enabled in a future release."
>
  Schedule client experience check-in
</button>
```

If conveying the reason for disabling to AT is required, use `aria-description` (supported in modern browsers) rather than `title`:
```tsx
<button
  type="button"
  className="pill"
  disabled
  aria-description="This action will be enabled in a future release."
>
```

---

### A12. Sidebar Landmark Roles

**File:** `src/components/membership-dashboard/AdminSidebar.tsx`

The outer `<Box>` should be `<Box component="nav" aria-label="Membership navigation">` — this is already proposed in A9 above.

**File:** `src/components/talent-discovery/student-components/StudentSideBar.tsx`

The outer `<Box>` should be `<Box component="nav" aria-label="Student portal navigation">`.

This gives screen reader users a direct jump point to navigation via the landmark list, and means they do not have to Tab through the entire sidebar to reach main content.

---

### A13. Touch Target Size — `.pill` in `globals.css`

**File:** `src/app/globals.css` (line 770–783)

**Issue:** `.pill { padding: 0.45rem 0.9rem }` creates an approximately 23px tall touch target at 16px base font.

**Fix:** Increase vertical padding and optionally use `min-height` to guarantee the minimum:
```css
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.9rem;   /* was 0.45rem — now ~27px, closer to 44px with 16px line-height */
  min-height: 44px;           /* hard floor for touch targets */
  border-radius: 999px;
  ...
}
```

Note: for the `SecondaryNav` pills (which are disabled and visual-only), the min-height still improves the overall layout rhythm, but the primary driver for this change is the `BenefitsFilterToolbar` toggles which are interactive.

---

*End of Evaluation*

**Document owner:** Team 1 (Talent Platform)
**Review requested from:** Daniel (client-side), development leads
