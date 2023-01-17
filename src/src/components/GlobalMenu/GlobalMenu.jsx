import React, { useState } from "react";
import { Route, Switch } from "react-router-dom";
import { SiteLayout, NavBar, NavBarItem, Menu, NavBarIcon, H1 } from '@dfds-ui/react-components';
import { Account as AccountIcon, Menu as BurgerMenu, Search } from '@dfds-ui/icons/system';

import { Hero, AppBarIconButton, AppBarListItem, ListText } from '@dfds-ui/react-components';
import { Card, CardMedia, CardTitle, CardContent, CardActions, CardPriceTag } from '@dfds-ui/react-components';

import { Link } from "react-router-dom";

import {
  AppBar as DFDSAppBar,
  AppBarProvider,
  AppBarDrawer,
  AppBarItem,
  MenuPopOverContext,
  ListIcon,
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
          logoContainerProps: { as: 'a', href: '/' },
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