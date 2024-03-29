import { Badge, ButtonStack, Button, Spinner } from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import { TextBlock } from "components/Text";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { useContext, useState } from "react";
import { theme } from "@dfds-ui/theme";
import awsLogo from "./aws-logo.svg";
import k8sLogo from "./k8s-logo.svg";
import styles from "./resourceInfoBadges.module.css";
import { DetailedAwsCountSummary } from "pages/capabilities/AwsResourceCount";
import SelectedCapabilityContext from "../../SelectedCapabilityContext";

function RequestDialog({ isRequesting, onClose, onSubmit }) {
  const actions = (
    <>
      <ModalAction
        actionVariation="primary"
        submitting={isRequesting}
        onClick={onSubmit}
      >
        Request
      </ModalAction>
      <ModalAction
        style={{ marginRight: "1rem" }}
        disabled={isRequesting}
        actionVariation="secondary"
        onClick={onClose}
      >
        Cancel
      </ModalAction>
    </>
  );

  return (
    <>
      <Modal
        heading={`AWS Account & Kubernetes Namespace`}
        isOpen={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onClose}
        actions={actions}
      >
        <Text>
          In order to request an AWS Account and a Kubernetes Namespace, please
          click the <TextBlock>Request</TextBlock> button below.
        </Text>
        <Text styledAs="caption">
          <i>
            <strong>Please note</strong> <br />
            That manual steps are a part of the AWS Account & Kubernetes
            Namespace creation, so please allow for some hours for the request
            to be processed. Also remember that requests submitted late in the
            day, or during weekends, will not picked up until the following
            business day.
          </i>
        </Text>
      </Modal>
    </>
  );
}

const Requested = function () {
  return (
    <strong>
      <em style={{ color: theme.colors.text.secondary.primary }}>
        An AWS Account & a Kubernetes Namespace has already been requested...
      </em>
    </strong>
  );
};

const Pending = function () {
  return (
    <div className={styles.pending}>
      <div className={styles.items}>
        <strong>
          <em style={{ color: theme.colors.status.warning }}>
            The AWS Account & Kubernetes Namespace are under way... Please wait
          </em>
        </strong>
      </div>
      <div className={styles.items}>
        <Spinner instant />
      </div>
    </div>
  );
};

const Completed = function ({ accountId, namespace, id }) {
  return (
    <>
      <div className={styles.completed}>
        <div className={styles.items}>
          <p>
            <img src={awsLogo} alt="AWS icon" style={{ height: "2.5rem" }} />
          </p>
          <div>AWS Acount ready:</div>
          <Badge>
            <strong>{accountId} </strong>
          </Badge>
          <br />
          <DetailedAwsCountSummary capabilityId={id}></DetailedAwsCountSummary>
        </div>
        <div className={styles.items}>
          <p>
            <img src={k8sLogo} alt="K8s icon" style={{ height: "2.5rem" }} />
          </p>
          <div>Kubernetes Namespace ready:</div>
          <Badge>
            <strong>{namespace}</strong>
          </Badge>
        </div>
      </div>
    </>
  );
};

export function ResourceInfoBadges() {
  // if user cannot see: return <> </>
  const { id, awsAccount, links, requestAwsAccount, setAwsAccountRequested } =
    useContext(SelectedCapabilityContext);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canRequest = (links?.awsAccount?.allow || []).includes("POST");

  const handleSubmitClicked = async () => {
    setIsSubmitting(true);
    await requestAwsAccount();
    setIsSubmitting(false);
    setAwsAccountRequested(true);
    setShowDialog(false);
  };

  const closeDialog = () => {
    if (!isSubmitting) {
      setShowDialog(false);
    }
  };

  return (
    <>
      <hr className={styles.divider} />

      {awsAccount != null ? (
        <>
          {awsAccount.status === "Completed" && (
            <Completed
              accountId={awsAccount.accountId}
              namespace={awsAccount.namespace}
              id={id}
            />
          )}
          {awsAccount.status === "Requested" && <Requested />}
          {awsAccount.status === "Pending" && <Pending />}
        </>
      ) : (
        <>
          {showDialog && (
            <RequestDialog
              isRequesting={isSubmitting}
              onClose={closeDialog}
              onSubmit={handleSubmitClicked}
            />
          )}

          <div className={styles.pending}>
            <div className={styles.items}>
              <strong>
                <em style={{ color: theme.colors.text.secondary.primary }}>
                  No AWS Account or Kubernetes Namespace linked with this
                  Capability.
                </em>
              </strong>
            </div>
            <div className={styles.items}>
              <ButtonStack align="right">
                {canRequest && (
                  <Button onClick={() => setShowDialog(true)}>
                    Request AWS Account & Kubernetes Namespace
                  </Button>
                )}
              </ButtonStack>
            </div>
          </div>
        </>
      )}
    </>
  );
}
