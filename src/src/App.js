import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { SiteLayout } from "@dfds-ui/react-components";

import GlobalMenu from "./components/GlobalMenu/GlobalMenu";
import FrontPage from "./pages/frontpage";
import TopicsPage from "./pages/topics";
import CapabilitiesPage from "./pages/capabilities";
import CapabilityDetailsPage from "./pages/capabilities/details";
import ECRPage from "./pages/ecr";

import { AuthenticatedTemplate } from "@azure/msal-react";

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
      <AuthenticatedTemplate>
        <SiteLayout.Grid>
          <SiteLayout.Header>
            <GlobalMenu />
          </SiteLayout.Header>
          <SiteLayout.Main>
            <Outlet />
            <Footer />
          </SiteLayout.Main>
        </SiteLayout.Grid>
      </AuthenticatedTemplate>

      {/* <UnauthenticatedTemplate>
      nooooooo
    </UnauthenticatedTemplate> */}
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
          <Route path="capabilities/:id" element={<CapabilityDetailsPage />} />
        </Route>
      </Routes>
    </>
  );
}
