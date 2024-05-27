import {
  Badge,
  ButtonStack,
  Button,
  Spinner,
} from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import { TextBlock } from "components/Text";
import { Modal, ModalAction, setGlobalAppElement } from "@dfds-ui/modal";
import { useContext, useState, useEffect } from "react";
import { theme } from "@dfds-ui/theme";
import awsLogo from "./aws-logo.svg";
import k8sLogo from "./k8s-logo.svg";
import styles from "./resourceInfoBadges.module.css";
import { DetailedAwsCountSummary } from "pages/capabilities/AwsResourceCount";
import SelectedCapabilityContext from "../../SelectedCapabilityContext";
import azureLogo from "./azure-logo.svg";

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
  const {
    id,
    awsAccount,
    links,
    requestAwsAccount,
    setAwsAccountRequested,
    azureResourcesList,
    addNewAzure,
    isLoadedAzure,
  } = useContext(SelectedCapabilityContext);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [environment, setEnvironment] = useState("prod");
  const canRequest = (links?.awsAccount?.allow || []).includes("POST");
  const environments = ["prod", "dev", "staging", "uat", "training", "test"];
  const [envAvailability, setEnvAvailability] = useState(null);

  const handleChange = (event) => {
    setEnvironment(event.target.value);
  };

  useEffect(() => {
    if (azureResourcesList != null) {
      setEnvAvailability(() => {
        const copy = [...azureResourcesList];
        var payload = [];
        environments.forEach((env) => {
          const found = copy.find((x) => x.environment == env);
          if (found) {
            payload.push({ env: found.environment, exist: true });
          } else {
            payload.push({ env: env, exist: false });
          }
        });
        return payload;
      });
    }
  }, [azureResourcesList]);

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

  const handleNewAzureResource = () => {
    addNewAzure(environment);
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

      <hr className={styles.divider} />

      <p style={{ textAlign: "center" }}>
        <img src={azureLogo} alt="Azure icon" style={{ height: "2.5rem" }} />
      </p>

      <div className={styles.azure}>
        <div className={styles.items}>
          {azureResourcesList != [] && isLoadedAzure ? (
            azureResourcesList.map((x) => (
              <div key={x.id}>
                <div className={styles.environment}>
                  Azure resources for the {x.environment} environment:
                </div>
                <div className={styles.azureresource}>
                  <Badge>
                    <strong>{x.id} </strong>
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div>
              {" "}
              <strong>
                <em style={{ color: theme.colors.text.secondary.primary }}>
                  No Azure resources linked with this Capability.
                </em>
              </strong>
            </div>
          )}
        </div>

        <div className={styles.items}>
          <div className={styles.envsection}>
            <div className={styles.envitems}>
              <label>
                To create a new Azure resource choose an environment:
              </label>

              {envAvailability != null ? (
                <select
                  style={{ marginLeft: "3px" }}
                  className={styles.envbutton}
                  value={environment}
                  onChange={handleChange}
                >
                  {envAvailability.map((env) => (
                    <option value={env.env} key={env.env} disabled={env.exist}>
                      {env.env}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <div></div>
                </>
              )}
            </div>

            <Button
              style={{ marginTop: "1rem" }}
              onClick={() => handleNewAzureResource()}
            >
              {" "}
              Request Azure Resource Group{" "}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
