import React, { useState, useEffect, useContext } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import AppContext from "./AppContext";

import FrontPage from "./pages/frontpage";
import TopicsPage from "./pages/topics";
import CapabilitiesPage from "./pages/capabilities";
import CapabilityDetailsPage from "./pages/capabilities/details";
import CapabilityCriticalityPage from "./pages/capabilities/criticality";
import CapabilitySelfAssessmentsPage from "./pages/capabilities/SelfAssessments";
import ECRPage from "./pages/ecr";
import ReleaseNotes from "./pages/release-notes";
import AuthTemplate from "./auth/AuthTemplate";
import ReleaseNotesCreate from "./pages/release-notes/create";
import ReleaseNotesManage from "./pages/release-notes/manage";
import ReleaseNotesEdit from "./pages/release-notes/edit";
import ReleaseNotesView from "./pages/release-notes/view";
import DemosPage from "./pages/demos";
import CompliancePage from "./pages/compliance";
import RbacViewerPage from "./pages/admin/rbac";
import DeletionQueuePage from "./pages/admin/capabilities/deletion-queue";
import MembershipApplicationsAdminPage from "./pages/admin/membership-applications";
import UserInspectorPage from "./pages/admin/rbac/user";
import AdminCompliancePage from "./pages/admin/compliance";
import TopicExplorerPage from "./pages/admin/topics";
import CapabilityAdminDetailPage from "./pages/admin/capabilities/detail";
import BulkMetadataPage from "./pages/admin/capabilities/metadata";
import MemberSearchPage from "./pages/admin/members";
import EcrSyncDashboardPage from "./pages/admin/ecr";
import PlatformMetricsDashboardPage from "./pages/admin/metrics";
import JsonSchemaEditorPage from "./pages/admin/json-schema";
import EmailCampaignsPage from "./pages/admin/email-campaigns";
import EmailCampaignEditor from "./pages/admin/email-campaigns/editor";
import EmailCampaignDetail from "./pages/admin/email-campaigns/detail";
import Sidebar from "./components/Sidebar/Sidebar";
import TopBar from "./components/TopBar/TopBar";
import { TopBarActionsProvider } from "./components/TopBar/TopBarActionsContext";

function PageTransition({ children }) {
  return <div className="animate-fade-up">{children}</div>;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem" }}>
          <p>
            Oh no! Something went wrong while loading the page. You can try{" "}
            <button
              onClick={() => window.location.reload()}
              className="text-action underline cursor-pointer bg-transparent border-none p-0 font-inherit"
            >
              refreshing the page
            </button>{" "}
            to resolve the issue.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFoundPage() {
  return (
    <div className="px-5 md:px-8 py-16 text-center">
      <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-3">
        // 404
      </div>
      <h1 className="text-[2rem] font-bold text-[#002b45] dark:text-[#e2e8f0] mb-2">
        Page not found
      </h1>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useContext(AppContext);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const userLoaded =
    user?.isAuthenticated === true && user?.roles !== undefined;
  const isCloudEngineer =
    userLoaded &&
    Array.isArray(user.roles) &&
    user.roles.some((r) => /^\s*cloud\.engineer\s*$/i.test(r));
  const showAdminGuard = isAdminRoute && userLoaded && !isCloudEngineer;
  const showAdminLoader = isAdminRoute && !userLoaded;

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <AuthTemplate>
      <TopBarActionsProvider>
        <div className="flex min-h-screen bg-surface-muted">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-[#002b45] focus:text-white focus:rounded-[5px] focus:text-sm focus:no-underline"
          >
            Skip to main content
          </a>
          {/* Mobile backdrop */}
          <div
            className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200 ${
              mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <Sidebar
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />
          <div className="flex flex-col flex-1 min-w-0">
            <TopBar
              onMenuOpen={() => setMobileOpen(true)}
              menuOpen={mobileOpen}
            />
            <main
              id="main-content"
              className="flex-1 bg-surface-muted overflow-x-clip"
            >
              {isAdminRoute && isCloudEngineer && (
                <div className="flex items-center gap-2 px-5 md:px-8 py-2 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-[12px] font-mono font-semibold tracking-[0.12em]">
                  <span aria-hidden="true">⚠</span>
                  WORK IN PROGRESS — This section is under active development
                  and may change without notice.
                </div>
              )}
              {showAdminLoader ? null : showAdminGuard ? (
                <NotFoundPage />
              ) : (
                <ErrorBoundary key={location.pathname}>
                  <PageTransition>
                    <Outlet />
                  </PageTransition>
                </ErrorBoundary>
              )}
            </main>
          </div>
        </div>
      </TopBarActionsProvider>
    </AuthTemplate>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<FrontPage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="capabilities" element={<CapabilitiesPage />} />
          <Route path="ecr" element={<ECRPage />} />
          <Route path="release-notes" element={<ReleaseNotes />} />
          <Route path="release-notes/create" element={<ReleaseNotesCreate />} />
          <Route path="release-notes/manage" element={<ReleaseNotesManage />} />
          <Route path="release-notes/edit/:id" element={<ReleaseNotesEdit />} />
          <Route path="release-notes/v/:id" element={<ReleaseNotesView />} />
          <Route
            path="capabilities/criticality"
            element={<CapabilityCriticalityPage />}
          />
          <Route
            path="capabilities/selfassessments"
            element={<CapabilitySelfAssessmentsPage />}
          />
          <Route path="capabilities/:id" element={<CapabilityDetailsPage />} />
          <Route path="demos" element={<DemosPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="admin/rbac" element={<RbacViewerPage />} />
          <Route path="admin/rbac/user" element={<UserInspectorPage />} />
          <Route
            path="admin/capabilities/deletion-queue"
            element={<DeletionQueuePage />}
          />
          <Route
            path="admin/capabilities/:id"
            element={<CapabilityAdminDetailPage />}
          />
          <Route
            path="admin/membership-applications"
            element={<MembershipApplicationsAdminPage />}
          />
          <Route path="admin/compliance" element={<AdminCompliancePage />} />
          <Route path="admin/topics" element={<TopicExplorerPage />} />
          <Route
            path="admin/capabilities/metadata"
            element={<BulkMetadataPage />}
          />
          <Route path="admin/members" element={<MemberSearchPage />} />
          <Route path="admin/ecr" element={<EcrSyncDashboardPage />} />
          <Route
            path="admin/metrics"
            element={<PlatformMetricsDashboardPage />}
          />
          <Route path="admin/json-schema" element={<JsonSchemaEditorPage />} />
          <Route
            path="admin/email-campaigns"
            element={<EmailCampaignsPage />}
          />
          <Route
            path="admin/email-campaigns/create"
            element={<EmailCampaignEditor />}
          />
          <Route
            path="admin/email-campaigns/edit/:id"
            element={<EmailCampaignEditor />}
          />
          <Route
            path="admin/email-campaigns/:id"
            element={<EmailCampaignDetail />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
