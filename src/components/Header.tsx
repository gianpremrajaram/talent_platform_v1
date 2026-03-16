// src/components/Header.tsx
"use client";

import React, { useEffect, useState} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { siteAnnouncement } from "@/content/siteMeta";
import { getServicesForAudience } from "@/content/services";
import styles from "./Header.module.css";

type MenuState = {
  students: boolean;
  researchers: boolean;
  partners: boolean;
  account: boolean;
};

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

const roleKeys = ((user as any)?.roleKeys ?? []) as string[];
const isAdmin = roleKeys.includes("ADMIN");

  const studentsServices = getServicesForAudience("students");
  const researchersServices = getServicesForAudience("researchers");
  const partnersServices = getServicesForAudience("partners");

  const [open, setOpen] = useState<MenuState>({
    students: false,
    researchers: false,
    partners: false,
    account: false,
  });

  function toggleMenu(key: keyof MenuState) {
    setOpen((prev) => ({
      students: false,
      researchers: false,
      partners: false,
      account: false,
      [key]: !prev[key],
    }));
  }

  function closeAllMenus() {
    setOpen({
      students: false,
      researchers: false,
      partners: false,
      account: false,
    });
  }

  // Close any open menu when Escape is pressed (keyboard accessibility)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" || event.key === "Esc") {
        closeAllMenus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

return (
  <header className="banner app-header" role="banner">
    {/* Top utility bar */}
    <div className={styles.utilityBar}>
      <div className={styles.utilityLeft}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Open menu"
        >
          <span className="hamburger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <div className={styles.workspacePill} aria-label="Workspace">
          <span className={styles.workspaceIcon} aria-hidden="true">🖥️</span>
          <span className={styles.workspaceName}>{isAdmin ? "Admin" : "User"}</span>
          <span className={styles.workspaceBadge}>Free</span>
          <span className={styles.workspaceCaret} aria-hidden="true">▾</span>
        </div>

        <div className={styles.utilityDivider} />

        <button
          type="button"
          className={styles.searchPill}
          aria-label="Search"
        >
          <span className={styles.searchText}>Search</span>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span> 
        </button>
      </div>

      <div className={styles.utilityRight}>
        <button type="button" className={styles.iconButton} aria-label="Apps">
          <span className="grid-icon" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
        </button>

        {isAdmin && (
          <Link
            href="/account/add-user"
            className="icon-button"
            aria-label="Add user"
            title="Add user"
          >
            <span className="add-user-icon" aria-hidden="true">
              <span className="user-head" />
              <span className="user-body" />
              <span className="plus-horizontal" />
              <span className="plus-vertical" />
            </span>
          </Link>
        )}

        <button
          type="button"
          className="icon-button notification-button"
          aria-label="Notifications"
        >
          <span className="bell-icon" aria-hidden="true">
            <span className="bell-top" />
            <span className="bell-body" />
            <span className="bell-clapper" />
          </span>
          <span className={styles.notificationBadge}>9</span>
        </button>

        <button type="button" className={styles.iconButton} aria-label="Messages">
          <span className="dots-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <button type="button" className={styles.iconButton} aria-label="Settings">
          <span className="gear-icon" aria-hidden="true">⚙</span>
        </button>

        <div className={styles.userAvatar} aria-label="User profile">
          {user?.name?.[0] ?? user?.email?.[0] ?? "U"}
        </div>
      </div>
    </div>

    {/* Optional existing announcement / branding row 
    <div className="banner-top">
      <a
        className="logo"
        href="https://www.ucl.ac.uk/engineering/computer-science"
      >
        <img
          src="/images/UCL-Computer-Science-logo.jpg"
          alt="UCL Computer Science"
        />
      </a>

      <div className={styles.teamName}>ALLIANCES</div>

      <div className={styles.announceWrap}>
        {siteAnnouncement.enabled && siteAnnouncement.text && (
          <div
            className={styles.lcdAnnouncement}
            role="status"
            aria-live="polite"
          >
            <div className={styles.lcdText}>{siteAnnouncement.text}</div>
            {siteAnnouncement.ctaLabel && siteAnnouncement.ctaHref && (
              <Link
                className={styles.lcdCta}
                href={siteAnnouncement.ctaHref}
              >
                {siteAnnouncement.ctaLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>*/}

    {/* Existing nav 
    <div className={styles.bannerNav} onMouseLeave={closeAllMenus}>
      <nav className={styles.navBar} aria-label="Primary">
        <ul className={styles.navRoot} role="menubar">
          <li className={styles.navItem} role="none">
            <Link
              className={styles.navLink}
              href="/"
              role="menuitem"
              aria-current={pathname === "/" ? "page" : undefined}
            >
              Home
            </Link>
          </li>

          <li className={styles.navItem} role="none">
            <button
              className={styles.menuButton}
              id="btn-students"
              aria-haspopup="true"
              aria-expanded={open.students}
              aria-controls="menu-students"
              onClick={() => toggleMenu("students")}
            >
              For students <span aria-hidden="true" className={styles.menuCaret}>▾</span>
            </button>
            <ul
              className={styles.menuPanel}
              id="menu-students"
              role="menu"
              aria-labelledby="btn-students"
              hidden={!open.students}
            >
              {studentsServices.map((svc) => {
                const label = svc.navLabel ?? svc.title;

                if (!svc.navActive) {
                  return (
                    <li key={svc.slug} role="none">
                      <span
                        role="menuitem"
                        className={styles.navLink + " " + styles.disabled}
                        aria-disabled="true"
                        tabIndex={-1}
                      >
                        {label}
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={svc.slug} role="none">
                    <Link
                      role="menuitem"
                      className={styles.navLink}
                      href={`/services/${svc.slug}`}
                      onClick={closeAllMenus}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          <li className={styles.navItem} role="none">
            <button
              className={styles.menuButton}
              id="btn-researchers"
              aria-haspopup="true"
              aria-expanded={open.researchers}
              aria-controls="menu-researchers"
              onClick={() => toggleMenu("researchers")}
            >
              For researchers <span aria-hidden="true" className={styles.menuCaret}>▾</span>
            </button>
            <ul
              className={styles.menuPanel}
              id="menu-researchers"
              role="menu"
              aria-labelledby="btn-researchers"
              hidden={!open.researchers}
            >
              {researchersServices.map((svc) => {
                const label = svc.navLabel ?? svc.title;

                if (!svc.navActive) {
                  return (
                    <li key={svc.slug} role="none">
                      <span
                        role="menuitem"
                        className={styles.navLink + " " + styles.disabled}
                        aria-disabled="true"
                        tabIndex={-1}
                      >
                        {label}
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={svc.slug} role="none">
                    <Link
                      role="menuitem"
                      className={styles.navLink}
                      href={`/services/${svc.slug}`}
                      onClick={closeAllMenus}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          <li className={styles.navItem} role="none">
            <button
              className={styles.menuButton}
              id="btn-partners"
              aria-haspopup="true"
              aria-expanded={open.partners}
              aria-controls="menu-partners"
              onClick={() => toggleMenu("partners")}
            >
              For partners <span aria-hidden="true" className={styles.menuCaret}>▾</span>
            </button>
            <ul
              className={styles.menuPanel}
              id="menu-partners"
              role="menu"
              aria-labelledby="btn-partners"
              hidden={!open.partners}
            >
              {partnersServices.map((svc) => {
                const label = svc.navLabel ?? svc.title;

                if (!svc.navActive) {
                  return (
                    <li key={svc.slug} role="none">
                      <span
                        role="menuitem"
                        className={styles.navLink + " " + styles.disabled}
                        aria-disabled="true"
                        tabIndex={-1}
                      >
                        {label}
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={svc.slug} role="none">
                    <Link
                      role="menuitem"
                      className={styles.navLink}
                      href={`/services/${svc.slug}`}
                      onClick={closeAllMenus}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {isAuthenticated ? (
            <li className={styles.navItem} role="none">
              <button
                className={styles.menuButton}
                id="btn-account"
                aria-haspopup="true"
                aria-expanded={open.account}
                aria-controls="menu-account"
                onClick={() => toggleMenu("account")}
              >
                Account <span aria-hidden="true" className={styles.menuCaret}>▾</span>
              </button>
              <ul
                className={styles.menuPanel}
                id="menu-account"
                role="menu"
                aria-labelledby="btn-account"
                hidden={!open.account}
              >
                <li role="none">
                  <span
                    className={styles.navLink}
                    role="menuitem"
                    aria-disabled="true"
                  >
                    You are signed in as{" "}
                    {user?.name ?? user?.email ?? "Alliances user"}
                  </span>
                </li>

                {isAdmin && (
                  <li role="none">
                    <Link
                      className={styles.navLink}
                      role="menuitem"
                      href="/account/add-user"
                      onClick={closeAllMenus}
                    >
                      Add user
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          ) : (
            <li className={styles.navItem} role="none">
              <Link className={styles.navLink} href="/login" role="menuitem">
                Sign in
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>*/}
  </header>
);
}
