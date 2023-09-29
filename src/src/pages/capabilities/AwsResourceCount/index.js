import { useContext } from "react";
import awsLogo from "./aws-logo.svg";
import AppContext from "AppContext";
import styles from "./AwsCount.module.css";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@dfds-ui/react-components";

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
  const count = metricsWrapper.getAwsResourcesTotalCountForCapability(capabilityId);
  
  const interests = [
    ["RDS", "Databases", "aws_rds_db_total"],
    ["S3", "Buckets", "aws_s3_bucket_total"],
    ["SSM", "Parameters", "aws_ssm_parameter_total"],
    ["Lambda", "Functions", "aws_lambda_function_total"],
    ["ECS", "Clusters", "aws_ecs_cluster_total"],
    ["EC2", "Fleet", "aws_ec2_fleet_total"],
    ["IAM", "Policies", "aws_iam_policy_total"],
    ["Dynamo", "Tables", "aws_dynamo_table_total"]
  ];
  let noteworthyCounts = new Map();
  let noteworthySubtitles = new Map();
  
  for (let [title, subtitle, resourceName] of interests) {
    var interestCount = metricsWrapper.getAwsResourceCountsForCapabilityAndType(capabilityId, resourceName);
    if (interestCount > 0) {
      noteworthyCounts.set(title, interestCount);
      noteworthySubtitles.set(title, subtitle)
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
      />)}
    
      {(count > 0) && (
        <>
          <p className={styles.resourceHint}>Please note that cards are only shown for resource types in actual use and includes everything for that type according to AWS. Click on any card for the complete list of resources.</p>
          <div className={styles.FlexContainer}  onClick={() => setShowResourcesWindow(true)} >
            {noteworthyInterests.map((i) => (
              <AwsCountCard key={i} title={i} subtitle={noteworthySubtitles.get(i)} count={noteworthyCounts.get(i)}/>
            ))}
            <AwsCountCard title="Total" subtitle="Everything" count={count}/>
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
  const { metricsWrapper } = useContext(AppContext);
  const counts = metricsWrapper.getAwsResourceCountsForCapability(capabilityId);

  const sorted_counts = new Map([...counts.entries()].sort((a, b) => b[1] - a[1]));

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
          s: "50%",
          m: "50%",
          l: "50%",
          xl: "50%",
          xxl: "50%",
        }}
      >
        <Table isInteractive width={"100%"}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Resource</TableHeaderCell>
              <TableHeaderCell align="center">Count</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(sorted_counts.entries()).map(([resource, count]) => (
              <TableRow key={resource}>
                <TableDataCell>
                  {resource}
                </TableDataCell>
                <TableDataCell align="center">
                  {count}
                </TableDataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Modal>
    </>
  );
}
