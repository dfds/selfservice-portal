import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { SiteLayout } from "@dfds-ui/react-components";

import GlobalMenu from "./components/GlobalMenu/GlobalMenu";
import FrontPage from "./pages/frontpage";
import TopicsPage from "./pages/topics";
import CapabilitiesPage from "./pages/capabilities";
import CapabilityDetailsPage from "./pages/capabilities/details";
import CapabilityCriticalityPage from "./pages/capabilities/criticality";
import CapabilitySelfAssessmentsPage from "./pages/capabilities/SelfAssessments";
import ECRPage from "./pages/ecr";
import ReleaseNotes from "./pages/release-notes";
import { AuthenticatedTemplate } from "@azure/msal-react";
import AuthTemplate from "auth/AuthTemplate";
import ReleaseNotesCreate from "./pages/release-notes/create";
import ReleaseNotesManage from "./pages/release-notes/manage";
import ReleaseNotesEdit from "./pages/release-notes/edit";
import ReleaseNotesView from "./pages/release-notes/view";

function Footer() {
  return (
    <div className="globalfooter">
      By: Cloud Engineering | Released: {process.env.REACT_APP_DATE_OF_RELEASE}
    </div>
  );
}

function Layout() {
  return (
    <>
      <AuthTemplate>
        <SiteLayout.Grid>
          <SiteLayout.Header>
            <GlobalMenu />
          </SiteLayout.Header>
          <SiteLayout.Main>
            <Outlet />
            <Footer />
          </SiteLayout.Main>
        </SiteLayout.Grid>
      </AuthTemplate>
    </>
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
        </Route>
      </Routes>
    </>
  );
}
