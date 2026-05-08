import React, { useContext, useMemo, useState } from "react";
import awsLogo from "./aws-logo.svg";
import AppContext from "@/AppContext";
import styles from "./AwsCount.module.css";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/Text";
import { MaterialReactTable } from "material-react-table";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useCapabilitiesAwsResources } from "@/state/remote/queries/platformdataapi";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTheme, useMuiTableColors } from "@/context/ThemeContext";


const USE_MOCK = true;

const MOCK_DATA = new Map([
  [
    "cloudengineering-xxx",
    [
      { resourceId: "aws_rds_db_total", resourceCount: 3 },
      { resourceId: "aws_s3_bucket_total", resourceCount: 12 },
      { resourceId: "aws_ssm_parameter_total", resourceCount: 45 },
      { resourceId: "aws_lambda_function_total", resourceCount: 7 },
      { resourceId: "aws_ecs_cluster_total", resourceCount: 2 },
      { resourceId: "aws_ec2_fleet_total", resourceCount: 1 },
      { resourceId: "aws_iam_policy_total", resourceCount: 18 },
      { resourceId: "aws_iam_role_total", resourceCount: 34 },
      { resourceId: "aws_dynamo_table_total", resourceCount: 5 },
      { resourceId: "aws_sqs_queue_total", resourceCount: 9 },
      { resourceId: "aws_sns_topic_total", resourceCount: 4 },
      { resourceId: "aws_cloudwatch_alarm_total", resourceCount: 22 },
      { resourceId: "aws_cloudwatch_log_group_total", resourceCount: 31 },
      { resourceId: "aws_secretsmanager_total", resourceCount: 6 },
      { resourceId: "aws_kms_key_total", resourceCount: 8 },
      { resourceId: "aws_vpc_total", resourceCount: 2 },
      { resourceId: "aws_subnet_total", resourceCount: 6 },
      { resourceId: "aws_security_group_total", resourceCount: 14 },
      { resourceId: "aws_elasticache_cluster_total", resourceCount: 1 },
      { resourceId: "aws_alb_total", resourceCount: 3 },
      { resourceId: "aws_alb_target_group_total", resourceCount: 5 },
      { resourceId: "aws_cloudfront_distribution_total", resourceCount: 2 },
      { resourceId: "aws_route53_zone_total", resourceCount: 3 },
      { resourceId: "aws_route53_record_total", resourceCount: 27 },
      { resourceId: "aws_ecr_repository_total", resourceCount: 4 },
      { resourceId: "aws_eks_cluster_total", resourceCount: 1 },
      { resourceId: "aws_codepipeline_total", resourceCount: 3 },
      { resourceId: "aws_codebuild_project_total", resourceCount: 5 },
      { resourceId: "aws_stepfunctions_statemachine_total", resourceCount: 2 },
      { resourceId: "aws_apigateway_rest_api_total", resourceCount: 4 },
      { resourceId: "aws_cognito_user_pool_total", resourceCount: 1 },
      { resourceId: "aws_wafv2_web_acl_total", resourceCount: 2 },
    ],
  ],
]);

function useMockResources() {
  const get = (capabilityId) =>
    MOCK_DATA.get(capabilityId) ?? MOCK_DATA.get("__default__");
  return {
    query: { isFetched: true, data: MOCK_DATA },
    getAwsResourcesTotalCountForCapability: (id) =>
      get(id).reduce((s, r) => s + r.resourceCount, 0),
    getAwsResourceCountsForCapability: (id) => get(id),
    getAwsResourceCountsForCapabilityAndType: (id, type) =>
      get(id).filter((r) => r.resourceId.includes(type))
        .reduce((s, r) => s + r.resourceCount, 0),
  };
}

function useResources() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return USE_MOCK ? useMockResources() : useCapabilitiesAwsResources();
}



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
  } = useResources();
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

function SortIcon({ direction }) {
  if (!direction) return <span className="ml-1 opacity-30">↕</span>;
  return <span className="ml-1">{direction === "asc" ? "↑" : "↓"}</span>;
}

function ResourcesWindow({ onCloseRequested, capabilityId }) {
  const { getAwsResourceCountsForCapability } = useResources();
  const counts = getAwsResourceCountsForCapability(capabilityId);
  const isMobile = useIsMobile();
  const { isDark } = useTheme();
  const { bg, bgMuted, textPrimary, textBody, borderColor } = useMuiTableColors();

  const muiTheme = useMemo(
    () => createTheme({ palette: { mode: isDark ? "dark" : "light" } }),
    [isDark],
  );

  const countsArray = [...counts].map((val) => ({
    name: val.resourceId,
    count: val.resourceCount,
  }));

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ renderedCellValue }) => (
          <Text styledAs="action" as="div">{renderedCellValue}</Text>
        ),
      },
      {
        accessorKey: "count",
        header: "Count",
        Cell: ({ renderedCellValue }) => (
          <Text styledAs="action" as="div">{renderedCellValue}</Text>
        ),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
      },
    ],
    [],
  );

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onCloseRequested()}>
      <DialogContent className={cn(isMobile ? "max-w-[95%]" : "max-w-[60%]", "flex flex-col max-h-[90vh]")}>
        <DialogHeader>
          <DialogTitle>Complete list of resources in AWS</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          <ThemeProvider theme={muiTheme}>
            <MaterialReactTable
              columns={columns}
              data={countsArray}
              muiTableHeadCellProps={{
                sx: {
                  fontWeight: "700",
                  fontSize: "16px",
                  fontFamily: "DFDS",
                  color: textPrimary,
                  backgroundColor: bg,
                  borderBottom: `1px solid ${borderColor}`,
                },
              }}
              muiTableBodyCellProps={{
                sx: {
                  fontWeight: "400",
                  fontSize: "16px",
                  fontFamily: "DFDS",
                  color: textBody,
                  backgroundColor: bg,
                  padding: "5px",
                  borderBottom: `1px solid ${borderColor}`,
                },
              }}
              muiTableBodyRowProps={{
                sx: {
                  "&:hover td": { backgroundColor: bgMuted },
                },
              }}
              muiTablePaperProps={{
                elevation: 0,
                sx: { borderRadius: "0", backgroundColor: bg },
              }}
              enablePagination={false}
              enableTopToolbar={false}
              enableBottomToolbar={false}
              enableColumnActions={false}
              enableColumnFilters={false}
            />
          </ThemeProvider>
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onCloseRequested}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
