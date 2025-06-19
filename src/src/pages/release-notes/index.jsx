import React, { useState, useMemo, useEffect, useContext } from "react";
import { MaterialReactTable } from "material-react-table";
import {
  Card,
  CardTitle,
  CardContent,
  CardActions,
  CardMedia,
  Spinner,
} from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import { Modal, ModalAction } from "@dfds-ui/modal";
import Page from "components/Page";
import PageSection from "components/PageSection";
import styles from "./releasenotes.module.css";
import { useEcrRepositories } from "@/state/remote/queries/ecr";
import { TrackedButton, TrackedLink } from "@/components/Tracking";

const asDate = (dateString) => {
  let millis = Date.parse(dateString);
  let date = new Date(millis);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const documentationUrl =
  "https://wiki.dfds.cloud/playbooks/supporting-services/ecr/push_image_to_an_ecr_repository";
const NoUri = () => {
  return (
    <Text>
      Error producing URI. Please refer to the{" "}
      <TrackedLink trackName="Wiki-ECRRepositoryPush" href={documentationUrl}>
        documentation
      </TrackedLink>
    </Text>
  );
};

function Repositories() {
  const { isFetched, data } = useEcrRepositories();
  const [showRepositoryDetails, setShowRepositoryDetails] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState(null);

  const clickHandler = (data) => {
    setSelectedRepository(data);
    setShowRepositoryDetails(true);
  };

  function RepositoryDetails({ onCloseRequested }) {
    const actions = (
      <>
        {/*ModalActions does not support danger/warning variations currently*/}
        <ModalAction
          style={{ marginRight: "1rem" }}
          actionVariation="secondary"
          onClick={onCloseRequested}
        >
          Close
        </ModalAction>
      </>
    );

    return (
      <>
        <Modal
          heading={`ECR Repository details`}
          isOpen={true}
          shouldCloseOnOverlayClick={true}
          shouldCloseOnEsc={true}
          onRequestClose={onCloseRequested}
          actions={actions}
        >
          <div className={styles.container}>
            <div className={styles.column}>
              <Text styledAs={"smallHeadline"}>Description</Text>{" "}
              <span className={styles.breakwords}>
                {selectedRepository.description}
              </span>
            </div>
          </div>
          <div className={styles.container}>
            <div className={styles.column}>
              <Text styledAs={"smallHeadline"}>Name</Text>{" "}
              <span className={styles.breakwords}>
                {selectedRepository.name}
              </span>
            </div>
          </div>
          <div className={styles.container}>
            <div className={styles.column}>
              <Text styledAs={"smallHeadline"}>URI</Text>{" "}
              <span className={styles.breakwords}>
                {selectedRepository.uri ? selectedRepository.uri : <NoUri />}
              </span>
            </div>
          </div>
          <div className={styles.container}>
            <div className={styles.column}>
              <Text styledAs={"smallHeadline"}>Creation</Text>{" "}
              <span className={styles.breakwords}>
                {asDate(selectedRepository.requestedAt)}, by{" "}
                {selectedRepository.createdBy}
              </span>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  const columns = useMemo(
    () => [
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
    ],
    [],
  );

  return (
    <>
      {showRepositoryDetails && (
        <RepositoryDetails
          onCloseRequested={() => {
            setShowRepositoryDetails(false);
          }}
          repository={selectedRepository}
        />
      )}
      <PageSection headline={`Repositories`}>
        {!isFetched && <Spinner />}
        {isFetched && (
          <MaterialReactTable
            columns={columns}
            data={data}
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
                padding: "15px",
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
              placeholder: `Find a repository...`,
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
            muiTableBodyRowProps={({ row }) => {
              return {
                onClick: () => {
                  clickHandler(row.original);
                },
                sx: {
                  cursor: "pointer",
                  padding: 0,
                  margin: 0,
                  minHeight: 0,
                  "&:hover td": {
                    backgroundColor: "rgba(187, 221, 243, 0.4)",
                  },
                },
              };
            }}
          />
        )}
      </PageSection>
    </>
  );
}

export default function ReleaseNotes() {
  const [showNewRepositoryDialog, setShowNewRepositoryDialog] = useState(false);

  return (
    <>
      <Page title="Release notes">
        <Card variant="fill" surface="main" size="xl" reverse={true}>
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
            <p>
              For more information on how to use the ECR repositories, please
              refer to the{" "}
              <TrackedLink
                trackName="Wiki-ECRRepositoryPush"
                href={documentationUrl}
              >
                documentation
              </TrackedLink>
            </p>
          </CardContent>
          <CardActions>
            <TrackedButton
              trackName="ShowNewRepositoryDialog"
              size="small"
              onClick={() => setShowNewRepositoryDialog(true)}
            >
              New repository
            </TrackedButton>
          </CardActions>
        </Card>
        <Repositories />
      </Page>
    </>
  );
}
