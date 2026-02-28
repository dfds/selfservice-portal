import React from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";

import FrontPage from "./pages/frontpage";
import TopicsPage from "./pages/topics";
import CapabilitiesPage from "./pages/capabilities";
import CapabilityDetailsPage from "./pages/capabilities/details";
import CapabilityCriticalityPage from "./pages/capabilities/criticality";
import CapabilitySelfAssessmentsPage from "./pages/capabilities/SelfAssessments";
import ECRPage from "./pages/ecr";
import ReleaseNotes from "./pages/release-notes";
import AuthTemplate from "auth/AuthTemplate";
import ReleaseNotesCreate from "./pages/release-notes/create";
import ReleaseNotesManage from "./pages/release-notes/manage";
import ReleaseNotesEdit from "./pages/release-notes/edit";
import ReleaseNotesView from "./pages/release-notes/view";
import DemosPage from "./pages/demos";
import Sidebar from "./components/Sidebar/Sidebar";
import TopBar from "./components/TopBar/TopBar";
import { TopBarActionsProvider } from "./components/TopBar/TopBarActionsContext";


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
              className="text-[#0e7cc1] underline cursor-pointer bg-transparent border-none p-0 font-inherit"
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

function Layout() {
  const location = useLocation();
  return (
    <AuthTemplate>
      <TopBarActionsProvider>
        <div className="flex min-h-screen bg-[#f2f2f2] dark:bg-[#0f172a]">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <TopBar />
            <main className="flex-1 bg-[#f2f2f2] dark:bg-[#0f172a]">
              <ErrorBoundary key={location.pathname}>
                <Outlet />
              </ErrorBoundary>
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
        </Route>
      </Routes>
    </>
  );
}
