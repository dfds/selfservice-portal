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
        style={{ marginRight: "1rem" }}
        disabled={isRequesting}
        actionVariation="secondary"
        onClick={onClose}
      >
        Cancel
      </ModalAction>
      <ModalAction
        actionVariation="primary"
        submitting={isRequesting}
        onClick={onSubmit}
      >
        Request
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
      {awsAccountInformation?.vpcs &&
      awsAccountInformation?.vpcs?.length > 0 ? (
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

function AzureResourceRequest({ onClose, azureResourcesList }) {
  const { addNewAzure } = useContext(SelectedCapabilityContext);
  const [acceptedCloudUsageGuidelines, setAcceptedCloudUsageGuidelines] =
    useState(false);
  const [environment, setEnvironment] = useState("test");
  const environments = ["dev", "test", "uat", "prod"];
  const [envAvailability, setEnvAvailability] = useState(null);

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

  const actions = (
    <>
      <ModalAction
        style={{ marginRight: "1rem" }}
        actionVariation="secondary"
        onClick={onClose}
      >
        Cancel
      </ModalAction>
      <ModalAction
        style={{ marginRight: "1rem" }}
        actionVariation="primary"
        onClick={() => {
          addNewAzure(environment);
          onClose();
        }}
        disabled={!acceptedCloudUsageGuidelines}
      >
        Request
      </ModalAction>
    </>
  );

  return (
    <>
      <Modal
        heading={`Request New Azure Resource Group`}
        isOpen={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onClose}
        actions={actions}
      >
        <div className={styles.items}>
          <Text>
            Please select an target environment for this new resource group.
          </Text>
          <div className={styles.envsection}>
            <div className={styles.envitems}>
              <label>Environment:</label>
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
                  <div>error</div>
                </>
              )}
            </div>
          </div>

          <Text>
            Please confirm that you have read and understood{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://wiki.dfds.cloud/en/architecture/adrs/which-cloud"
            >
              the DFDS Cloud Usage Guidelines
            </a>
            . This document outlines what usecases are permitted for Azure, for
            Vercel, and for AWS.
          </Text>
          <div className={styles.envsection}>
            <div>
              <input
                type="checkbox"
                checked={acceptedCloudUsageGuidelines}
                style={{ marginRight: "5px" }}
                onChange={() => {
                  setAcceptedCloudUsageGuidelines(
                    !acceptedCloudUsageGuidelines,
                  );
                }}
              />
              <label>I have read the Cloud Usage Guidelines</label>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function ResourceInfoBadges() {
  // if user cannot see: return <> </>
  const {
    id,
    awsAccount,
    awsAccountInformation,
    links,
    requestAwsAccount,
    setAwsAccountRequested,
    azureResourcesList,
    isLoadedAzure,
    metadata,
  } = useContext(SelectedCapabilityContext);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canRequest = (links?.awsAccount?.allow || []).includes("POST");
  const requiredTags = [
    "dfds.planned_sunset",
    "dfds.owner",
    "dfds.cost.centre",
    "dfds.service.availability",
  ];
  const [missingTags, setMissingTags] = useState([]);
  const [showAzureTagsWarning, setShowAzureTagsWarning] = useState(false);
  const [showNewAzureResourcePopup, setShowNewAzureResourcePopup] =
    useState(false);

  const [showLogModal, setLogModal] = useState(false);
  const handleApplicationLogShow = async () => {
    setLogModal(true);
  };

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
    if (missingTags.length === 0) {
      setShowNewAzureResourcePopup(true);
    } else {
      setShowAzureTagsWarning(true);
    }
  };

  const generateResourceGroupLink = (environment) => {
    const urlmap = {
      dev: "9a68caae-8d74-4289-9f3c-31e96120aef9",
      test: "bad472ab-19cd-4654-9657-8c91ab59f248",
      uat: "6be18e97-e76a-4a58-8a31-5628be3efeeb",
      prod: "60773f07-9b34-4256-968b-c07d5abe447a",
    };
    return `https://portal.azure.com/#@DFDS.onmicrosoft.com/resource/subscriptions/${urlmap[environment]}/resourceGroups/rg-dfds_ssu_${environment}_${id}/overview`;
  };

  return (
    <>
      <hr className={styles.divider} />

      {awsAccount !== null ? (
        <>
          {awsAccount.status === "Completed" && (
            <>
              <Completed
                accountId={awsAccount.accountId}
                namespace={awsAccount.namespace}
                id={id}
              />
              {awsAccountInformation !== null && (
                <VPCPeerings awsAccountInformation={awsAccountInformation} />
              )}
            </>
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

          <p style={{ textAlign: "center" }}>
            <img src={awsLogo} alt="AWS icon" style={{ height: "2.5rem" }} />
            &nbsp;&nbsp;&nbsp;
            <img src={k8sLogo} alt="K8S icon" style={{ height: "2.5rem" }} />
          </p>
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
      {awsAccount && awsAccount.status === "Completed" && (
        <>
          <br />

          <ButtonStack
            align="center"
            style={{ margin: "auto", marginTop: "15px", width: "400px" }}
          >
            <Button
              size="small"
              variation="outlined"
              onClick={handleApplicationLogShow}
            >
              How to see application logs?
            </Button>
          </ButtonStack>
        </>
      )}

      <Modal
        heading={"How do I see my application logs?"}
        isOpen={showLogModal}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={() => {
          setLogModal(false);
        }}
        sizes={{
          s: "50%",
          m: "50%",
          l: "50%",
          xl: "50%",
          xxl: "50%",
        }}
      >
        <Text>
          <Text as="span" styledAs={"smallHeadline"}>
            For applications running in Kubernetes
          </Text>
        </Text>
        <Text>
          1. Sign into the <i>dfds-logs</i> account using the{" "}
          <i>CapabilityLog</i> role at{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://dfds.awsapps.com/start/"
          >
            https://dfds.awsapps.com/start/
          </a>
          <br />
          2. Once signed in, make sure your region is set to <i>eu-west-1</i>.
          <br />
          3. Navigate to the CloudWatch service either using the navigation menu
          or{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#home:"
          >
            this link
          </a>
          <br />
          4. Once there, select "Logs" in the menu on your left, and then "Logs
          Insights"
          <br />
          5. From this view, you can query logs in Kubernetes. For example
          queries, please check our wiki article at{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://wiki.dfds.cloud/en/playbooks/observability/logging_cloudwatch"
          >
            https://wiki.dfds.cloud/en/playbooks/observability/logging_cloudwatch
          </a>
        </Text>
      </Modal>

      <hr className={styles.divider} />

      {showAzureTagsWarning && (
        <AzureTagsWarning
          onClose={() => setShowAzureTagsWarning(false)}
          missingTags={missingTags}
        />
      )}

      {showNewAzureResourcePopup && (
        <AzureResourceRequest
          onClose={() => setShowNewAzureResourcePopup(false)}
          azureResourcesList={azureResourcesList}
        />
      )}

      <div style={{ textAlign: "center" }}>
        <img src={azureLogo} alt="Azure icon" style={{ height: "2.5rem" }} />
        <Text>
          Please refer to the{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://wiki.dfds.cloud/en/documentation/azure/azure-capability-developer"
          >
            Azure Capability Developer Guide
          </a>
        </Text>
      </div>

      <div className={styles.azure}>
        <div className={styles.items}>
          {azureResourcesList &&
          azureResourcesList.length !== 0 &&
          isLoadedAzure ? (
            <>
              <Text>
                The following Azure Resource Groups have been created for this
                capability:
              </Text>
              {azureResourcesList.map((resource) => (
                <div key={resource.id} className={styles.environmentlist}>
                  <a
                    className={styles.environmentlink}
                    href={generateResourceGroupLink(resource.environment)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className={styles.environmentbadge}>
                      {resource.environment}
                    </div>
                  </a>
                </div>
              ))}
            </>
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
            <ButtonStack align="right">
              <Button
                style={{ marginTop: "1rem" }}
                onClick={() => handleNewAzureResource()}
              >
                Request New Azure Resource Group
              </Button>
            </ButtonStack>
          </div>
        </div>
      </div>
    </>
  );
}
