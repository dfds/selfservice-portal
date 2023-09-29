import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  AppBar as DFDSAppBar,
  AppBarProvider,
  AppBarDrawer,
  AppBarItem,
  AppBarIconButton,
  AppBarListItem,
  MenuPopOverContext,
  ListText,
} from "@dfds-ui/react-components";
import { Account } from '@dfds-ui/icons/system'
import { SmallProfilePicture as ProfilePicture } from "components/ProfilePicture";
import AppContext from "AppContext";
import styles from "./GlobalMenu.module.css";

export default function GlobalMenu() {
  const { user } = useContext(AppContext);

  const navLinks = [
    {
      title: "Capabilities",
      url: "/capabilities",
    },
    {
      title: "Topics",
      url: "/topics",
    },
    {
      title: "ECR",
      url: "/ecr",
    },
    {
      title: "Playbooks",
      url: "https://wiki.dfds.cloud/playbooks",
    },
    {
      title: "GitHub (Code examples)",
      url: "https://github.com/dfds",
    },
    {
      title: "Status page",
      url: "https://dfdsit.statuspage.io/",
    },
  ];

  return (
    <>
      <AppBarProvider>
        <DFDSAppBar
          logoProps={{
            logoContainerProps: { as: "a", href: "/" },
          }}
          leftActions={<></>}
          actions={
            <>
              <AppBarItem
                id="profile"
                Icon={Account}
                title="Profile"
                //as={ProfilePicture}
                //pictureUrl={user.profilePictureUrl ?? ""}
                placement="bottom-end"
              >
                <MenuPopOverContext.Consumer>
                  {(context) => {
                    return (
                      <>
                        <AppBarListItem>
                          <ListText><span><b>{user.name ?? "<noname>"}</b><br/>{user.title ?? "<untitled>"}</span></ListText>
                        </AppBarListItem>
                        
                        <AppBarListItem
                          clickable
                          onClick={() => {
                            alert("Logout not implemented")
                            context.handlePopoverClose()
                          }}
                        >
                          <ListText>Logout</ListText>
                        </AppBarListItem>
                      </>
                    )
                  }}
                </MenuPopOverContext.Consumer>
              </AppBarItem>
            </>
          }
        >
          {navLinks.map((x) =>
            /https:?\/\//.test(x.url) ? (
              <a href={x.url} style={{ textDecoration: "none" }} key={x.title} className={styles.alignCenter}>
                <AppBarListItem clickable>
                  <ListText>{x.title}</ListText>
                </AppBarListItem>
              </a>
            ) : (
              <Link to={x.url} style={{ textDecoration: "none" }} key={x.title} className={styles.alignCenter}>
                <AppBarListItem clickable>
                  <ListText>{x.title}</ListText>
                </AppBarListItem>
              </Link>
            ),
          )}
        </DFDSAppBar>

        <AppBarDrawer>
          {navLinks.map((x) => (
            <Link to={x.url} style={{ textDecoration: "none" }} key={x.title}>
              <AppBarListItem clickable>
                <ListText>{x.title}</ListText>
              </AppBarListItem>
            </Link>
          ))}
        </AppBarDrawer>
      </AppBarProvider>
    </>
  );
}
