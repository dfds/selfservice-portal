import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppContext from "@/AppContext";
import PreAppContext from "../../preAppContext";
import styles from "./Header.module.css";

interface NavChild {
  title: string;
  url: string;
}

interface NavLink {
  title: string;
  url?: string;
  children?: NavChild[];
}

const navLinks: NavLink[] = [
  { title: "Capabilities", url: "/capabilities" },
  { title: "Topics", url: "/topics" },
  { title: "ECR", url: "/ecr" },
  { title: "Release notes", url: "/release-notes" },
  { title: "Demos", url: "/demos" },
  {
    title: "External links",
    children: [
      { title: "Playbooks", url: "https://wiki.dfds.cloud/playbooks" },
      { title: "Status page", url: "https://dfdsit.statuspage.io/" },
    ],
  },
];

function checkIfCloudEngineer(roles: string[]): boolean {
  const regex = /^\s*cloud\.engineer\s*$/i;
  return roles?.some((r) => regex.test(r.toLowerCase())) ?? false;
}

function DfdsLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 145 50"
      className={className}
      aria-label="DFDS"
      role="img"
    >
      <path
        d="m140.2 23.58-5.1-1.69c-1.15-.36-1.45-.59-1.45-1.81v-.46c0-1.65.63-1.65 2.17-1.65 3.26 0 7 .1 7 .1.39 0 .53-.13.53-.53V14c0-.4-.14-.53-.53-.53 0 0-4.12-.1-7.71-.1-4.08 0-6.45 1.76-6.45 5.57v1.78c0 4.12 2.34 4.82 4.54 5.51l5.07 1.65c1.16.36 1.45.69 1.45 1.91v.53c0 1.65-.59 1.76-2.14 1.76-3.51 0-8.21-.1-8.21-.1-.4 0-.53.13-.53.53v3.59c0 .4.13.53.53.53 0 0 4.79.1 8.9.1s6.44-1.93 6.44-5.75v-1.86c.03-4.12-2.33-4.85-4.51-5.54zM119.67 13.49H109c-.39 0-.53.13-.53.53V36c0 .4.14.53.53.53h10.63c4.09 0 6.46-2.27 6.46-6.1V19.59c.04-3.83-2.33-6.1-6.42-6.1zm1.49 16.06c0 1.64-.63 2.3-2.18 2.3h-5.49V18.14H119c1.55 0 2.18.65 2.18 2.31zM105.3 13.49H91.18c-.4 0-.53.13-.53.53V36c0 .4.13.53.53.53h3.92c.39 0 .52-.13.52-.53v-8.23h8.46c.4 0 .53-.13.53-.52v-3.61c0-.39-.13-.52-.53-.52h-8.46v-5h9.68c.4 0 .53-.14.53-.53V14c0-.38-.13-.51-.53-.51zM81 13.49H70.32c-.39 0-.53.13-.53.53V36c0 .4.14.53.53.53H81c4.08 0 6.45-2.27 6.45-6.1V19.59c-.04-3.83-2.45-6.1-6.45-6.1zm1.48 16.06c0 1.64-.62 2.3-2.17 2.3h-5.54V18.14h5.49c1.55 0 2.17.65 2.17 2.31zM69.4 0H29.18a.9.9 0 0 0-.85.5L.07 49.46a.33.33 0 0 0 .06.47.32.32 0 0 0 .27.07h40.2a.89.89 0 0 0 .86-.49L69.72.54a.33.33 0 0 0-.07-.47.32.32 0 0 0-.25-.07zm-23 32a.28.28 0 0 1-.27.28.42.42 0 0 1-.15 0l-9.2-5.31 5.31 9.2a.28.28 0 0 1-.1.38.33.33 0 0 1-.14 0H27.94a.28.28 0 0 1-.28-.28.23.23 0 0 1 0-.14l5.3-9.2-9.17 5.27a.28.28 0 0 1-.38-.11.31.31 0 0 1 0-.13V18a.27.27 0 0 1 .28-.27.28.28 0 0 1 .13 0L33 23.11l-5.31-9.2a.28.28 0 0 1 .1-.38.33.33 0 0 1 .14 0h13.91a.29.29 0 0 1 .28.28.23.23 0 0 1 0 .14l-5.31 9.2L46 17.8a.27.27 0 0 1 .38.1.23.23 0 0 1 0 .14z"
        fill="#002b45"
      />
    </svg>
  );
}

function AccountIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12.453 14c4.226 0 7.996 2.657 9.417 6.637l0.13 0.363h-20l0.13-0.363c1.421-3.98 5.191-6.637 9.417-6.637h0.906zM12 3c2.761 0 5 2.239 5 5s-2.239 5-5 5c-2.761 0-5-2.239-5-5s2.239-5 5-5z"
      />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path fill="currentColor" d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      />
    </svg>
  );
}

export default function Header() {
  const { user } = useContext(AppContext);
  const { isCloudEngineerEnabled, setIsCloudEngineerEnabled } =
    useContext(PreAppContext);
  const location = useLocation();

  const [isCloudEngineer, setIsCloudEngineer] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.isAuthenticated) {
      setIsCloudEngineer(checkIfCloudEngineer(user.roles));
    }
  }, [user]);

  useEffect(() => {
    if (user?.isAuthenticated && isCloudEngineer) {
      setIsCloudEngineerEnabled(true);
    }
  }, [isCloudEngineer]);

  useEffect(() => {
    if (!profileOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [profileOpen]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  function isActive(url: string) {
    return location.pathname === url || location.pathname.startsWith(url + "/");
  }

  function toggleCloudEngineer() {
    setIsCloudEngineerEnabled((prev: boolean) => !prev);
  }

  const hasPicture =
    user?.profilePictureUrl !== undefined &&
    user?.profilePictureUrl !== null &&
    user?.profilePictureUrl !== "";

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          {/* Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>

          {/* Logo */}
          <Link to="/" className={styles.logo} aria-label="DFDS home">
            <DfdsLogo className={styles.logoSvg} />
          </Link>

          {/* Desktop nav */}
          <nav className={styles.desktopNav} aria-label="Main navigation">
            <ul className={styles.navList}>
              {navLinks.map((item) =>
                item.children ? (
                  <li key={item.title} className={styles.dropdown}>
                    <span className={styles.dropdownTrigger}>
                      {item.title}
                      <span className={styles.chevron} aria-hidden="true">
                        ▾
                      </span>
                    </span>
                    <ul className={styles.dropdownMenu}>
                      {item.children.map((child) => (
                        <li key={child.title}>
                          {/https?:\/\//.test(child.url) ? (
                            <a
                              href={child.url}
                              className={styles.dropdownItem}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {child.title}
                            </a>
                          ) : (
                            <Link
                              to={child.url}
                              className={styles.dropdownItem}
                            >
                              {child.title}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={item.title}>
                    {/https?:\/\//.test(item.url!) ? (
                      <a
                        href={item.url}
                        className={styles.navLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <Link
                        to={item.url!}
                        className={[
                          styles.navLink,
                          isActive(item.url!) ? styles.navLinkActive : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                ),
              )}
            </ul>
          </nav>

          {/* Right side: profile + hamburger */}
          <div className={styles.rightActions}>
            {/* Profile button */}
            <div className={styles.profileWrapper} ref={profileRef}>
              <button
                className={styles.profileButton}
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                {hasPicture ? (
                  <img
                    className={styles.profilePicture}
                    src={user.profilePictureUrl}
                    alt={user.name ?? "Profile"}
                  />
                ) : (
                  <AccountIcon className={styles.profileIcon} />
                )}
              </button>

              {profileOpen && (
                <div className={styles.profilePopover} role="menu">
                  <div className={styles.profileInfo}>
                    <div className={styles.profilePictureSmall}>
                      {hasPicture ? (
                        <img
                          className={styles.profilePictureLarge}
                          src={user.profilePictureUrl}
                          alt={user.name ?? "Profile"}
                        />
                      ) : (
                        <AccountIcon className={styles.profileIconLarge} />
                      )}
                    </div>
                    <div>
                      <strong>{user?.name ?? "<noname>"}</strong>
                      <br />
                      <span className={styles.profileTitle}>
                        {user?.title ?? "<untitled>"}
                      </span>
                    </div>
                  </div>

                  {isCloudEngineer && (
                    <label className={styles.toggleLabel}>
                      <span>Cloud Engineer</span>
                      <span className={styles.toggleWrapper}>
                        <input
                          type="checkbox"
                          role="switch"
                          className={styles.toggleInput}
                          checked={isCloudEngineerEnabled}
                          onChange={toggleCloudEngineer}
                        />
                        <span className={styles.toggleTrack}>
                          <span className={styles.toggleThumb} />
                        </span>
                      </span>
                    </label>
                  )}

                  {isCloudEngineerEnabled && (
                    <>
                      <Link
                        to="capabilities/criticality"
                        className={styles.popoverLink}
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                      >
                        Criticality Overview
                      </Link>
                      <Link
                        to="capabilities/selfassessments"
                        className={styles.popoverLink}
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                      >
                        Self Assessment Management
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className={styles.drawerOverlay}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className={[styles.drawer, drawerOpen ? styles.drawerOpen : ""]
          .filter(Boolean)
          .join(" ")}
        aria-label="Mobile navigation"
        aria-hidden={!drawerOpen}
      >
        <button
          className={styles.drawerClose}
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
        <ul className={styles.drawerList}>
          {navLinks.map((item) =>
            item.children ? (
              <React.Fragment key={item.title}>
                <li className={styles.drawerGroupHeader}>{item.title}</li>
                {item.children.map((child) => (
                  <li key={child.title} className={styles.drawerSubItem}>
                    {/https?:\/\//.test(child.url) ? (
                      <a
                        href={child.url}
                        className={styles.drawerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {child.title}
                      </a>
                    ) : (
                      <Link to={child.url} className={styles.drawerLink}>
                        {child.title}
                      </Link>
                    )}
                  </li>
                ))}
              </React.Fragment>
            ) : (
              <li key={item.title}>
                {/https?:\/\//.test(item.url!) ? (
                  <a
                    href={item.url}
                    className={styles.drawerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.title}
                  </a>
                ) : (
                  <Link
                    to={item.url!}
                    className={[
                      styles.drawerLink,
                      isActive(item.url!) ? styles.drawerLinkActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {item.title}
                  </Link>
                )}
              </li>
            ),
          )}
        </ul>
      </nav>
    </>
  );
}
