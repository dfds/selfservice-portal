import React, { useContext, useMemo } from "react";
import awsLogo from "./aws-logo.svg";
import AppContext from "@/AppContext";
import styles from "./AwsCount.module.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Text } from "@/components/ui/Text";
import { MaterialReactTable } from "material-react-table";
import { useCapabilitiesAwsResources } from "@/state/remote/queries/platformdataapi";
import { useIsMobile } from "@/hooks/useIsMobile";

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
  const isMobile = useIsMobile();

  const countsArray = [...counts].map((val) => ({
    name: val.resourceId,
    count: val.resourceCount,
  }));

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
    <Dialog open={true} onOpenChange={(o) => !o && onCloseRequested()}>
      <DialogContent className={isMobile ? "max-w-[95%]" : "max-w-[60%]"}>
        <DialogHeader>
          <DialogTitle>Complete list of resources in AWS</DialogTitle>
        </DialogHeader>
        {isMobile ? (
          <div className="divide-y divide-divider max-h-[60vh] overflow-y-auto">
            {countsArray.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between px-3 py-2.5"
              >
                <span className="text-sm text-primary">{item.name}</span>
                <span className="text-sm font-medium text-primary tabular-nums">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
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
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onCloseRequested}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
