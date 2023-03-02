import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { SiteLayout } from '@dfds-ui/react-components';

import GlobalMenu from "./components/GlobalMenu/GlobalMenu";
import FrontPage from "./pages/frontpage";
import TopicsPage from "./pages/topics";
import CapabilitiesPage from "./pages/capabilities";
import CapabilityDetailsPage from "./pages/capabilities/details";

import { AuthenticatedTemplate } from "@azure/msal-react";

function Layout() {
  return <>
    <AuthenticatedTemplate>
      <SiteLayout.Grid>
        <SiteLayout.Header>
          <GlobalMenu />
        </SiteLayout.Header>
        <SiteLayout.Main>
          <Outlet />
        </SiteLayout.Main>
      </SiteLayout.Grid>
    </AuthenticatedTemplate>

    {/* <UnauthenticatedTemplate>
      nooooooo
    </UnauthenticatedTemplate> */}
  </>
}

export default function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<FrontPage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="capabilities" element={<CapabilitiesPage />} />
          <Route path="capabilities/:id" element={<CapabilityDetailsPage />} />
        </Route>
      </Routes>
    </>
  )
}
