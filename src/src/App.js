import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { SiteLayout } from "@dfds-ui/react-components";

import GlobalMenu from "./components/GlobalMenu/GlobalMenu";
import FrontPage from "./pages/frontpage";
import TopicsPage from "./pages/topics";
import CapabilitiesPage from "./pages/capabilities";
import CapabilityDetailsPage from "./pages/capabilities/details";

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

  React.useEffect(() => {
      var _mtm = window._mtm = window._mtm || [];
      _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src='https://build.dfds.cloud/tr/js/container_nbYsx3GM.js'; s.parentNode.insertBefore(g,s);
    }, []);

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
  );
}
