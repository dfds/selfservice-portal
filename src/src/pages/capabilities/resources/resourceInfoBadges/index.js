import { Badge, ButtonStack, Button, Spinner } from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import { TextBlock } from "components/Text";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { useContext, useState, useEffect } from "react";
import { theme } from "@dfds-ui/theme";
import awsLogo from "./aws-logo.svg";
import k8sLogo from "./k8s-logo.svg";
import styles from "./resourceInfoBadges.module.css";
import { DetailedAwsCountSummary } from "pages/capabilities/AwsResourceCount";
import SelectedCapabilityContext from "../../SelectedCapabilityContext";
import azureLogo from "./azure-logo.svg";

/*
function VPCInformation(id, region, cidrBlock) {
  return (
    <div>
      VPC id: <span className={styles.informationtext}>{id}</span>, Region:{" "}
      <span className={styles.informationtext}>{region}</span>, CIDR:{" "}
      <span className={styles.informationtext}>
        {(cidrBlock !== "" && cidrBlock) || "unknown"}
      </span>
    </div>
  );
}
*/

function AzureTagsWarning({ onClose, missingTags }) {
  const actions = (
    <>
      <ModalAction
        style={{ marginRight: "1rem" }}
        actionVariation="secondary"
        onClick={onClose}
      >
        Close
      </ModalAction>
    </>
  );

  return (
    <>
      <Modal
        heading={`Azure Resource Groups Tags Required`}
        isOpen={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onClose}
        actions={actions}
      >
        <Text>
          Your capability are missing needed tags (see:{" "}
          <a href="https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy">
            tagging guideline
          </a>
          ) in its metadata in order to create an Azure Resource group. Please
          add the following tags:
        </Text>
        <div>
          <ul>
            {missingTags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  );
}

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

/*
const VPCPeerings = function ({ awsAccountInformation }) {
  return (
    <div className={styles.awsaccountinformationbox}>
      <span className={styles.subheader}>Peering VPCs</span>
      &emsp;
      <a
        href="https://wiki.dfds.cloud/en/documentation/aws/vpc-peering#using-the-vpc-peering-connection"
        className={styles.link}
      >
        (learn more)
      </a>
      {awsAccountInformation.vpcs && awsAccountInformation.vpcs?.length > 0 ? (
        awsAccountInformation.vpcs.map((vpc, index) => (
          <div key={index}>
            {VPCInformation(vpc.vpcId, vpc.region, vpc.cidrBlock)}
          </div>
        ))
      ) : (
        <div>No peering VPCs found</div>
      )}
    </div>
  );
};
*/

export function ResourceInfoBadges() {
  // if user cannot see: return <> </>
  const {
    id,
    awsAccount,
    //awsAccountInformation,
    links,
    requestAwsAccount,
    setAwsAccountRequested,
    azureResourcesList,
    addNewAzure,
    isLoadedAzure,
    metadata,
  } = useContext(SelectedCapabilityContext);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [environment, setEnvironment] = useState("test");
  const canRequest = (links?.awsAccount?.allow || []).includes("POST");
  const environments = ["dev", "staging", "test", "uat", "training", "prod"];
  const requiredTags = [
    "dfds.planned_sunset",
    "dfds.owner",
    "dfds.cost.centre",
    "dfds.service.availability",
  ];
  const [missingTags, setMissingTags] = useState([]);
  const [showAzureTagsWarning, setShowAzureTagsWarning] = useState(false);
  const [envAvailability, setEnvAvailability] = useState(null);

  const handleChange = (event) => {
    setEnvironment(event.target.value);
  };

  // set environment to first non-existing environment type
  useEffect(() => {
    if (envAvailability != null) {
      setEnvironment(() => {
        for (let i = 0; i < envAvailability.length; i++) {
          if (!envAvailability[i].exist) {
            return envAvailability[i].env;
          }
        }
      });
    }
  }, [envAvailability]);

  useEffect(() => {
    if (azureResourcesList != null) {
      setEnvAvailability(() => {
        const copy = [...azureResourcesList];
        var payload = [];
        environments.forEach((env) => {
          const found = copy.find((x) => x.environment === env);
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

  useEffect(() => {
    if (metadata !== null && requiredTags.length > 0) {
      const meta = JSON.parse(metadata);
      const missing = requiredTags.filter((tag) => !meta.hasOwnProperty(tag));

      // Only update state if the missing tags array has changed
      setMissingTags((prevMissingTags) => {
        if (
          prevMissingTags.length !== missing.length ||
          !prevMissingTags.every((tag, index) => tag === missing[index])
        ) {
          return missing;
        }
        return prevMissingTags; // No need to update if the array is the same
      });
    } else {
      setMissingTags([]); // Reset to empty array if metadata is null or requiredTags is empty
    }
  }, [metadata, requiredTags]);

  const handleNewAzureResource = () => {
    console.log("missing tags: ", missingTags);
    if (missingTags.length === 0) {
      addNewAzure(environment);
    } else {
      setShowAzureTagsWarning(true);
      console.log("showAzureTagsWarning: ", showAzureTagsWarning);
    }
  };

  useEffect(() => {
    console.log(showAzureTagsWarning);
  }, [showAzureTagsWarning]);

  return (
    <>
      <hr className={styles.divider} />

      {awsAccount !== null ? (
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
          {/*<VPCPeerings awsAccountInformation={awsAccountInformation} />*/}
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

      {showAzureTagsWarning && (
        <AzureTagsWarning
          onClose={() => setShowAzureTagsWarning(false)}
          missingTags={missingTags}
        />
      )}

      <p style={{ textAlign: "center" }}>
        <img src={azureLogo} alt="Azure icon" style={{ height: "2.5rem" }} />
      </p>

      <div className={styles.azure}>
        <div className={styles.items}>
          {azureResourcesList &&
          azureResourcesList.length !== 0 &&
          isLoadedAzure ? (
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
              Request Azure Resource Group
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
