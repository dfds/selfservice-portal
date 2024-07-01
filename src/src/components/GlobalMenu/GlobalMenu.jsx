import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar as DFDSAppBar,
  AppBarProvider,
  AppBarDrawer,
  AppBarItem,
  AppBarListItem,
  MenuPopOverContext,
  ListText,
} from "@dfds-ui/react-components";
import { Account } from "@dfds-ui/icons/system";
import { SmallProfilePicture as ProfilePicture } from "components/ProfilePicture";
import AppContext from "AppContext";
import styles from "./GlobalMenu.module.css";
import { Switch } from "@dfds-ui/forms";
import PreAppContext from "../../preAppContext";

function checkIfCloudEngineer(roles) {
  const regex = /^\s*cloud\.engineer\s*$/i;
  const match = roles?.some((element) => regex.test(element.toLowerCase()));
  return match;
}

export default function GlobalMenu() {
  const { user } = useContext(AppContext);
  const { isEnabledCloudEngineer, setIsEnabledCloudEngineer } =
    useContext(PreAppContext);

  const [isCloudEngineer, setIsCloudEngineer] = useState(false);
  useEffect(() => {
    if (user && user.isAuthenticated) {
      console.log(user.roles);
      setIsCloudEngineer(checkIfCloudEngineer(user.roles));
    }
  }, [user]);

  useEffect(() => {
    console.log(isCloudEngineer);
  }, [isCloudEngineer]);

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

  if (isCloudEngineer) {
    navLinks.push({
      title: "Criticality",
      url: "/capabilities/criticality",
    });
  }

  const toggleCloudEngineer = () => {
    setIsEnabledCloudEngineer((prev) => !prev);
  };

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
                placement="bottom-end"
              >
                <MenuPopOverContext.Consumer>
                  {(context) => {
                    return (
                      <>
                        <AppBarListItem>
                          <ListText>
                            <span>
                              <b>{user.name ?? "<noname>"}</b>
                              <br />
                              {user.title ?? "<untitled>"}
                            </span>
                          </ListText>
                          <ProfilePicture
                            clickable
                            as={AppBarItem}
                            title="Profile"
                            pictureUrl={user.profilePictureUrl ?? ""}
                            placement="bottom-end"
                          />
                        </AppBarListItem>
                        {isCloudEngineer ? (
                          <Switch
                            style={{ marginLeft: "1rem" }}
                            checked={isEnabledCloudEngineer}
                            onChange={toggleCloudEngineer}
                          >
                            Cloud Engineer
                          </Switch>
                        ) : (
                          <></>
                        )}
                      </>
                    );
                  }}
                </MenuPopOverContext.Consumer>
              </AppBarItem>
            </>
          }
        >
          {navLinks.map((x) =>
            /https:?\/\//.test(x.url) ? (
              <a
                href={x.url}
                style={{ textDecoration: "none" }}
                key={x.title}
                className={styles.alignCenter}
              >
                <AppBarListItem clickable>
                  <ListText>{x.title}</ListText>
                </AppBarListItem>
              </a>
            ) : (
              <Link
                to={x.url}
                style={{ textDecoration: "none" }}
                key={x.title}
                className={styles.alignCenter}
              >
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
