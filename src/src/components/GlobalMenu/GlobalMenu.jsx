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
import AppContext from "@/AppContext";
import styles from "./GlobalMenu.module.css";
import { Switch } from "@/components/dfds-ui/forms";
import PreAppContext from "../../preAppContext";
import { useQueryClient } from "@tanstack/react-query";
import SelectedCapabilityContext from "@/pages/capabilities/SelectedCapabilityContext";

function checkIfCloudEngineer(roles) {
  const regex = /^\s*cloud\.engineer\s*$/i;
  const match = roles?.some((element) => regex.test(element.toLowerCase()));
  return match;
}

export default function GlobalMenu() {
  const queryClient = useQueryClient();
  const { user } = useContext(AppContext);
  const { isCloudEngineerEnabled, setIsCloudEngineerEnabled } =
    useContext(PreAppContext);
  const [isCloudEngineer, setIsCloudEngineer] = useState(false);

  useEffect(() => {
    if (user && user.isAuthenticated && isCloudEngineer) {
      setIsCloudEngineerEnabled(true);
    }
  }, [isCloudEngineer]);

  useEffect(() => {
    if (user && user.isAuthenticated) {
      setIsCloudEngineer(checkIfCloudEngineer(user.roles));
    }
  }, [user]);

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

  function sleep(duration) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), duration);
    });
  }
  function toggleCloudEngineer() {
    setIsCloudEngineerEnabled((prev) => !prev);
  }

  useEffect(() => {
    async function updateData() {
      await sleep(202);
      queryClient.invalidateQueries({ queryKey: ["capabilities", "list"] });
      queryClient.invalidateQueries({ queryKey: ["capabilities", "details"] });
      queryClient.invalidateQueries({ queryKey: ["ecr", "repositories"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
    updateData();
  }, [isCloudEngineerEnabled]);

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
                            checked={isCloudEngineerEnabled}
                            onChange={toggleCloudEngineer}
                          >
                            Cloud Engineer
                          </Switch>
                        ) : (
                          <></>
                        )}
                        {isCloudEngineerEnabled ? (
                          <>
                            <Link
                              to="capabilities/criticality"
                              style={{ textDecoration: "none" }}
                              key="self-assessment-criticality"
                            >
                              <AppBarListItem clickable>
                                <ListText>Criticality Overview</ListText>
                              </AppBarListItem>
                            </Link>
                            <Link
                              to="capabilities/selfassessments"
                              style={{ textDecoration: "none" }}
                              key="self-assessment-management"
                            >
                              <AppBarListItem clickable>
                                <ListText>Self Assessment Management</ListText>
                              </AppBarListItem>
                            </Link>
                          </>
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
