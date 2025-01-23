import React, { useContext, useMemo } from "react";
import awsLogo from "./aws-logo.svg";
import AppContext from "AppContext";
import styles from "./AwsCount.module.css";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { useState } from "react";
import { Text } from "@dfds-ui/react-components";
import { MaterialReactTable } from "material-react-table";
import { useCapabilitiesAwsResources } from "@/state/remote/queries/platformdataapi";

export function InlineAwsCountSummary({ data }) {
  return (
    <>
      <div>
        <img src={awsLogo} alt="AWS icon" style={{ height: "1rem" }} />
        <span> {data}</span>
      </div>
    </>
  );
}

export function DetailedAwsCountSummary({ capabilityId }) {
  const { metricsWrapper } = useContext(AppContext);
  const [showResourcesWindow, setShowResourcesWindow] = useState(false);
  const {
    query,
    getAwsResourcesTotalCountForCapability,
    getAwsResourceCountsForCapabilityAndType,
  } = useCapabilitiesAwsResources();
  const count = getAwsResourcesTotalCountForCapability(capabilityId);

  const interests = [
    ["RDS", "Databases", "aws_rds_db_total"],
    ["S3", "Buckets", "aws_s3_bucket_total"],
    ["SSM", "Parameters", "aws_ssm_parameter_total"],
    ["Lambda", "Functions", "aws_lambda_function_total"],
    ["ECS", "Clusters", "aws_ecs_cluster_total"],
    ["EC2", "Fleet", "aws_ec2_fleet_total"],
    ["IAM", "Policies", "aws_iam_policy_total"],
    ["Dynamo", "Tables", "aws_dynamo_table_total"],
  ];
  let noteworthyCounts = new Map();
  let noteworthySubtitles = new Map();

  for (let [title, subtitle, resourceName] of interests) {
    var interestCount = getAwsResourceCountsForCapabilityAndType(
      capabilityId,
      resourceName,
    );
    if (interestCount > 0) {
      noteworthyCounts.set(title, interestCount);
      noteworthySubtitles.set(title, subtitle);
    }
  }
  let noteworthyInterests = [...noteworthyCounts.keys()];

  return (
    <>
      {showResourcesWindow && (
        <ResourcesWindow
          onCloseRequested={() => {
            setShowResourcesWindow(false);
          }}
          capabilityId={capabilityId}
        />
      )}

      {count > 0 && (
        <>
          <p className={styles.resourceHint}>
            Please note that cards are only shown for resource types in actual
            use and includes everything for that type according to AWS. Click on
            any card for the complete list of resources.
          </p>
          <div
            className={styles.FlexContainer}
            onClick={() => setShowResourcesWindow(true)}
          >
            {noteworthyInterests.map((i) => (
              <AwsCountCard
                key={i}
                title={i}
                subtitle={noteworthySubtitles.get(i)}
                count={noteworthyCounts.get(i)}
              />
            ))}
            <AwsCountCard title="Total" subtitle="Everything" count={count} />
          </div>
        </>
      )}
    </>
  );
}

function AwsCountCard({ title, subtitle, count }) {
  return (
    <>
      <div className={styles.SingleCountCard}>
        <span>{title}</span>
        <br />
        <span className={styles.SingleCountCardSubtitle}>{subtitle}</span>
        <br />
        <span className={styles.CountNumber}>{count}</span>
      </div>
    </>
  );
}

function ResourcesWindow({ onCloseRequested, capabilityId }) {
  const { getAwsResourceCountsForCapability } = useCapabilitiesAwsResources();
  const counts = getAwsResourceCountsForCapability(capabilityId);

  const countsArray = [...counts].map((val) => ({
    name: val.resourceId,
    count: val.resourceCount,
  }));
  const actions = (
    <>
      <ModalAction
        style={{ marginRight: "1rem" }}
        actionVariation="secondary"
        onClick={onCloseRequested}
      >
        Close
      </ModalAction>
    </>
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ renderedCellValue }) => {
          return (
            <Text styledAs="action" as={"div"}>
              {renderedCellValue}
            </Text>
          );
        },
      },
      {
        accessorKey: "count",
        header: "Count",
        Cell: ({ renderedCellValue }) => {
          return (
            <Text styledAs="action" as={"div"}>
              {renderedCellValue}
            </Text>
          );
        },
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
    ],
    [],
  );

  return (
    <>
      <Modal
        heading={`Complete list of resources in AWS`}
        isOpen={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onCloseRequested}
        actions={actions}
        sizes={{
          s: "60%",
          m: "60%",
          l: "60%",
          xl: "60%",
          xxl: "60%",
        }}
      >
        <MaterialReactTable
          columns={columns}
          data={countsArray}
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
          enablePagination={false}
          enableTopToolbar={false}
          enableBottomToolbar={false}
          enableColumnActions={false}
          enableColumnFilters={false}
        />
      </Modal>
    </>
  );
}
