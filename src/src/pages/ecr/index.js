import React, { useState, useMemo } from "react";
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
import NewRepositoryDialog from "./NewRepositoryDialog";
import { useECRRepositories } from "hooks/ECRRepositories";
import SplashImage from "./repository.jpg";
import styles from "./ecr.module.css";

function Repositories() {
  const { repositories, isLoading } = useECRRepositories();

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
    ],
    [],
  );

  return (
    <>
      <PageSection headline={`Repositories`}>
        {isLoading && <Spinner />}
        {!isLoading && (
          <MaterialReactTable
            columns={columns}
            data={repositories}
            initialState={{
              pagination: { pageSize: 50 },
              showGlobalFilter: true,
            }}
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
            enableGlobalFilterModes={true}
            positionGlobalFilter="left"
            muiSearchTextFieldProps={{
              placeholder: `Find a capability...`,
              sx: {
                minWidth: "1120px",
                fontWeight: "400",
                fontSize: "16px",
                padding: "5px",
              },
              size: "small",
              variant: "outlined",
            }}
            enablePagination={true}
            globalFilterFn="contains"
            enableFilterMatchHighlighting={true}
            enableDensityToggle={false}
            enableHiding={false}
            enableFilters={true}
            enableGlobalFilter={true}
            enableTopToolbar={true}
            enableBottomToolbar={true}
            enableColumnActions={false}
          />
        )}
      </PageSection>
    </>
  );
}

export default function ECRPage() {
  const [showNewRepositoryDialog, setShowNewRepositoryDialog] = useState(false);

  const splash = (
    <CardMedia
      aspectRatio="3:2"
      media={<img src={SplashImage} className={styles.cardMediaImage} alt="" />}
      className={styles.cardMedia}
    />
  );

  return (
    <>
      <Page title="ECR Repositories">
        {showNewRepositoryDialog && (
          <NewRepositoryDialog
            onClose={() => setShowNewRepositoryDialog(false)}
          />
        )}
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
              This is a comprehensive list of all AWS ECR Repositories that have
              been created by DFDS development teams. All users with access to
              this portal can request new repositories.
            </p>
            <p>
              When creating new repositories, please be mindful of the naming
              conventions. Normally the repository name should consist of the
              team name and the application name. For example:{" "}
              <b>cloudengineering/selfservice-portal</b>.
            </p>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              onClick={() => setShowNewRepositoryDialog(true)}
            >
              New repository
            </Button>
          </CardActions>
        </Card>
        <Repositories />
      </Page>
    </>
  );
}
