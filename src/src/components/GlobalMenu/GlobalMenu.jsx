import React from "react";
import { Link } from "react-router-dom";

import {
  AppBar as DFDSAppBar,
  AppBarProvider,
  AppBarDrawer,
  AppBarItem,
  AppBarListItem, 
  ListText
} from "@dfds-ui/react-components";

import ProfilePicture from "./ProfilePicture";
import ProfileName from "./ProfileName";

export default function GlobalMenu({}) {
  const navLinks = [
    {
      title: "Capabilities",
      url: "/capabilities"
    },
    {
      title: "Topics",
      url: "/topics"
    },
    {
      title: "Playbooks",
      url: "https://wiki.dfds.cloud/playbooks"
    },
    {
      title: "GitHub (Code examples)",
      url: "https://github.com/dfds"
    },
    {
      title: "UI",
      url: "/sharedcomponents"
    },
    {
      title: "Status page",
      url: "https://dfdsit.statuspage.io/"
    },
  ];
  
  return <>
    <AppBarProvider>
      <DFDSAppBar 
        logoProps={{
          logoContainerProps: { as: 'a', href: process.env.PUBLIC_URL },
        }}
        leftActions={
          <>
          </>
        }
        actions={
          <>
            {/* <AppBarIconButton icon={Search} ariaLabel="Search" /> */}
            <AppBarItem  title="Name" id="profile-name" as={ProfileName} />
            <AppBarItem  title="Profile" id="profile" as={ProfilePicture} />
          </>
        }>

        {navLinks.map(x => <Link to={x.url} style={{ textDecoration: "none" }} key={x.title}>
          <AppBarItem title={x.title} id={x.title} />  
        </Link>)}
      </DFDSAppBar>

      <AppBarDrawer >
        {navLinks.map(x => <Link to={x.url} style={{ textDecoration: "none" }} key={x.title}>
          <AppBarListItem clickable>
            <ListText>{x.title}</ListText>
          </AppBarListItem>
        </Link>)}
      </AppBarDrawer>

    </AppBarProvider>
  </>
}