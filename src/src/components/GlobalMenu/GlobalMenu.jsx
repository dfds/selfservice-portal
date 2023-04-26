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
      title: "Status page",
      url: "https://dfdsit.statuspage.io/"
    },
  ];

  return <>
    <AppBarProvider>
      <DFDSAppBar
        logoProps={{
          logoContainerProps: { as: 'a', href: "/" },
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

    {navLinks.map(x =>
        /https:?\/\//.test(x.url)
        ? <a href={x.url} style={{ textDecoration: "none" }} key={x.title}>
            <AppBarListItem clickable>
              <ListText>{x.title}</ListText>
            </AppBarListItem>
          </a>
        : <Link to={x.url} style={{ textDecoration: "none" }} key={x.title}>
          <AppBarListItem clickable>
            <ListText>{x.title}</ListText>
          </AppBarListItem>
        </Link>
      )
        }
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