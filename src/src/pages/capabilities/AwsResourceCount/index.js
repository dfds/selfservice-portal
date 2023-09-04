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
  
  const interests = ["rds", "s3", "ssm", "sqs", "ssn", "lambda", "ecs", "ec2", "iam"];
  let noteworthyCounts = new Map();
  
  for (let interest of interests) {
    var interestCount = metricsWrapper.getAwsResourceCountsForCapabilityAndType(capabilityId, interest);
    if (interestCount > 0) {
      noteworthyCounts.set(interest, interestCount);
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
    
    <div className={styles.FlexContainer}  onClick={() => setShowResourcesWindow(true)} >
      {noteworthyInterests.map((i) => (
        <AwsCountCard key={i} title={i} count={noteworthyCounts.get(i)}/>
      ))}
      <AwsCountCard title="Total" count={count}/>
    </div>
    </>
  );
}

function AwsCountCard({ title, count }) {
  return (
    <>
      <div className={styles.SingleCountCard}>
        <span>{title}</span>
        <br />
        <span className={styles.CountNumber}>{count}</span>
      </div>
    </>
  );
}

function ResourcesWindow({ onCloseRequested, capabilityId }) {
  const { metricsWrapper } = useContext(AppContext);
  const counts = metricsWrapper.getAwsResourceCountsForCapability(capabilityId);

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
        shouldCloseOnOverlayClick={false}
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
            {Array.from(counts.entries()).map(([resource, count]) => (
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
