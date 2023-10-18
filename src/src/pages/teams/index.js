import React, { useEffect, useState, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import {
  Card,
  CardTitle,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Text,
  Spinner,
} from "@dfds-ui/react-components";
import Page from "components/Page";
import PageSection from "components/PageSection";
import { useTeams } from "hooks/Teams";
import SplashImage from "./splash.jpeg";
import styles from "./teams.module.css";

function Teams() {
  const { teams, isLoading } = useTeams();

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 250,
        Cell: ({ renderedCellValue }) => {
          return (
            <Text styledAs="action" as={"div"}>
              {renderedCellValue}
            </Text>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 250,
        Cell: ({ renderedCellValue }) => {
          return (
            <Text styledAs="action" as={"div"}>
              {renderedCellValue}
            </Text>
          );
        },
      },
      {
        accessorKey: "capabilities",
        header: "Capabilities Linked",
        size: 250,
        Cell: ({ renderedCellValue }) => {
          return (
            <Text styledAs="action" as={"div"}>
              {renderedCellValue}
            </Text>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <PageSection headline={`Teams`}>
        {isLoading && <Spinner />}
        {!isLoading && (
          <MaterialReactTable
            columns={columns}
            data={teams}
            muiTableHeadCellProps={{
              sx: {
                fontWeight: "700",
                fontSize: "16px",
                fontFamily: "DFDS",
                color: "#002b45",
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                fontWeight: "400",
                fontSize: "16px",
                fontFamily: "DFDS",
                color: "#4d4e4c",
                padding: "5px",
              },
            }}
            muiTablePaperProps={{
              elevation: 0,
              sx: {
                borderRadius: "0",
              },
            }}
            muiTopToolbarProps={{
              sx: {
                background: "none",
              },
            }}
            muiBottomToolbarProps={{
              sx: {
                background: "none",
              },
            }}
            enableFilterMatchHighlighting={true}
            enableDensityToggle={false}
            enableHiding={false}
            enableFilters={true}
            enableGlobalFilter={true}
            enableColumnActions={false}
          />
        )}
      </PageSection>
    </>
  );
}

export default function TeamsPage() {
  const splash = (
    <CardMedia
      aspectRatio="3:2"
      media={<img src={SplashImage} className={styles.cardMediaImage} alt="" />}
      className={styles.cardMedia}
    />
  );

  return (
    <>
      <Page title="Teams">
        <Card
          variant="fill"
          surface="main"
          size="xl"
          reverse={true}
          media={splash}
        >
          <CardTitle largeTitle>Information</CardTitle>
          <CardContent>
            <p>
              Here you will find a list of teams in the Self Service Portal.
              Teams makes it possible to link users together and see what
              capabilities they have access to.
            </p>
            <p>
              Teams are not a reflection of the organization structure, but
              rather a way to group users together. The members of teams are
              determined by the capabilities they are linked to.
            </p>
          </CardContent>
          <CardActions>
            <Button size="small">New team</Button>
          </CardActions>
        </Card>
        <Teams />
      </Page>
    </>
  );
}
