import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/Text";
import { TextBlock } from "@/components/Text";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useContext, useState, useEffect } from "react";
import awsLogo from "./aws-logo.svg";
import k8sLogo from "./k8s-logo.svg";
import { DetailedAwsCountSummary } from "@/pages/capabilities/AwsResourceCount";
import SelectedCapabilityContext from "../../SelectedCapabilityContext";
import azureLogo from "./azure-logo.svg";
import { TrackedButton, TrackedLink } from "@/components/Tracking";
import Select from "react-select";
import AzureResourceGroupRequestWizard from "./resourceGroupRequestWizard";

const statusBadgeVariant = (status) =>
  status === "active" ? "soft-success" : "soft-warning";

function ResourceRow({
  label,
  value,
  sub,
  status,
  statusLabel,
  action,
  children,
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-divider last:border-0 gap-4">
      <div className="min-w-0">
        <div className="text-[12px] text-muted mb-[2px]">{label}</div>
        <div className="font-mono text-[13px] text-primary font-semibold leading-none">
          {value}
        </div>
        {sub && (
          <div className="font-mono text-[11px] text-muted mt-[2px]">{sub}</div>
        )}
        {children}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {action}
        {statusLabel && (
          <Badge
            variant={statusBadgeVariant(status)}
            className="flex-shrink-0 text-[10px] px-2 py-[3px]"
          >
            {statusLabel}
          </Badge>
        )}
      </div>
    </div>
  );
}

function ResourceSectionLabel({ logo, alt, children }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-2 border-b border-divider">
      {logo && <img src={logo} alt={alt ?? ""} style={{ height: "14px" }} />}
      <SectionLabel>{children}</SectionLabel>
    </div>
  );
}

function AzureTagsWarning({ onClose, missingTags }) {
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Azure Resource Groups Tags Required</DialogTitle>
        </DialogHeader>
        <Text>
          Your capability are missing needed tags (see:{" "}
          <TrackedLink
            trackName="Wiki-TaggingPolicy"
            href="https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"
          >
            tagging guideline
          </TrackedLink>
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequestDialog({ isRequesting, onClose, onSubmit }) {
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AWS Account &amp; Kubernetes Namespace</DialogTitle>
        </DialogHeader>
        <Text>
          Please familiarize yourself with the{" "}
          <TrackedLink
            trackName="Wiki-TaggingPolicy"
            href="https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"
          >
            DFDS tagging policy
          </TrackedLink>{" "}
          as you are responsible for tagging your cloud resources correctly.
        </Text>
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
        <DialogFooter>
          <Button variant="outline" disabled={isRequesting} onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isRequesting} onClick={onSubmit}>
            Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VPCPeerings({ awsAccountInformation }) {
  const vpcs = awsAccountInformation?.vpcs;
  if (!vpcs || vpcs.length === 0) return null;
  return (
    <>
      {vpcs.map((vpc, index) => (
        <ResourceRow
          key={index}
          label="Peering VPC"
          value={vpc.vpcId}
          sub={`${vpc.region} · ${vpc.cidrBlock || "unknown CIDR"}`}
          status="active"
          statusLabel="Peered"
        />
      ))}
    </>
  );
}

const REQUIRED_TAGS = [
  "dfds.cost.centre",
  "dfds.service.availability",
  "dfds.azure.purpose",
];

export function ResourceInfoBadges() {
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
    metadataFetched,
    addNewAzure,
  } = useContext(SelectedCapabilityContext);

  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canRequest = (links?.awsAccount?.allow || []).includes("POST");
  const [missingTags, setMissingTags] = useState([]);
  const [showAzureTagsWarning, setShowAzureTagsWarning] = useState(false);
  const [showNewAzureResourcePopup, setShowNewAzureResourcePopup] =
    useState(false);
  const [showLogModal, setLogModal] = useState(false);
  const [metaParsed, setMetaParsed] = useState(undefined);

  useEffect(() => {
    if (metadataFetched && metadata != null) {
      setMetaParsed(JSON.parse(metadata));
    } else {
      setMetaParsed(undefined);
    }
  }, [metadataFetched, metadata]);

  const handleSubmitClicked = async () => {
    setIsSubmitting(true);
    await requestAwsAccount();
    setIsSubmitting(false);
    setAwsAccountRequested(true);
    setShowDialog(false);
  };

  const closeDialog = () => {
    if (!isSubmitting) setShowDialog(false);
  };

  useEffect(() => {
    if (metaParsed !== undefined && REQUIRED_TAGS.length > 0) {
      const missing = REQUIRED_TAGS.filter(
        (tag) => !metaParsed.hasOwnProperty(tag),
      );
      setMissingTags((prev) => {
        if (
          prev.length !== missing.length ||
          !prev.every((tag, i) => tag === missing[i])
        ) {
          return missing;
        }
        return prev;
      });
    } else {
      setMissingTags([]);
    }
  }, [metaParsed]);

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

  const processNewResourceGroupData = (formData) => {
    return {
      environment: formData["environment"].value || "dev",
      purpose: metaParsed?.["dfds.azure.purpose"] || "unknown",
      catalogueId: formData["catalogueId"]
        ? formData["catalogueId"]
        : "unknown",
      risk: formData["riskCategory"]?.value
        ? formData["riskCategory"].value
        : "unknown",
      gdpr: formData["gdprData"]?.value
        ? formData["gdprData"].value === "yes"
        : false,
    };
  };

  return (
    <>
      {/* Dialogs */}
      {showDialog && (
        <RequestDialog
          isRequesting={isSubmitting}
          onClose={closeDialog}
          onSubmit={handleSubmitClicked}
        />
      )}
      {showAzureTagsWarning && (
        <AzureTagsWarning
          onClose={() => setShowAzureTagsWarning(false)}
          missingTags={missingTags}
        />
      )}
      {showNewAzureResourcePopup && (
        <AzureResourceGroupRequestWizard
          onCloseClicked={() => setShowNewAzureResourcePopup(false)}
          onRequestResourceGroupClicked={(formData) => {
            addNewAzure(processNewResourceGroupData(formData));
            setShowNewAzureResourcePopup(false);
          }}
          inProgress={false}
          azurePurpose={metaParsed?.["dfds.azure.purpose"] || "unknown"}
          azureResourcesList={azureResourcesList}
        />
      )}
      <Dialog
        open={showLogModal}
        onOpenChange={(o) => !o && setLogModal(false)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-[50%]">
          <DialogHeader>
            <DialogTitle>How do I see my application logs?</DialogTitle>
          </DialogHeader>
          <Text>
            <Text as="span" styledAs={"smallHeadline"}>
              For applications running in Kubernetes
            </Text>
          </Text>
          <Text>
            1. Sign into the <i>dfds-logs</i> account using the{" "}
            <i>CapabilityLog</i> role at{" "}
            <TrackedLink
              trackName="AWSConsole-Start"
              target="_blank"
              rel="noreferrer"
              href="https://dfds.awsapps.com/start/"
            >
              https://dfds.awsapps.com/start/
            </TrackedLink>
            <br />
            2. Once signed in, make sure your region is set to <i>eu-west-1</i>.
            <br />
            3. Navigate to the CloudWatch service either using the navigation
            menu or{" "}
            <TrackedLink
              trackName="AWSConsole-CloudWatch"
              target="_blank"
              rel="noreferrer"
              href="https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#home:"
            >
              this link
            </TrackedLink>
            <br />
            4. Once there, select "Logs" in the menu on your left, and then
            "Logs Insights"
            <br />
            5. From this view, you can query logs in Kubernetes. For example
            queries, please check our wiki article at{" "}
            <TrackedButton
              trackName="AWSConsole-CloudWatchLogging"
              target="_blank"
              rel="noreferrer"
              href="https://wiki.dfds.cloud/en/playbooks/observability/logging_cloudwatch"
              className="break-all whitespace-normal h-auto"
            >
              https://wiki.dfds.cloud/en/playbooks/observability/logging_cloudwatch
            </TrackedButton>
          </Text>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AWS / Kubernetes section */}
      <ResourceSectionLabel logo={awsLogo} alt="AWS">
        AWS &amp; Kubernetes
      </ResourceSectionLabel>

      {awsAccount == null && (
        <ResourceRow
          label="AWS Account &amp; Kubernetes Namespace"
          value="Not provisioned"
          action={
            canRequest ? (
              <TrackedButton
                trackName="RequestAWSAccountAndK8SNamespace"
                size="small"
                onClick={() => setShowDialog(true)}
              >
                Request
              </TrackedButton>
            ) : null
          }
        />
      )}

      {awsAccount?.status === "Requested" && (
        <ResourceRow
          label="AWS Account &amp; Kubernetes Namespace"
          value="Request submitted"
          status="requested"
          statusLabel="Requested"
        />
      )}

      {awsAccount?.status === "Pending" && (
        <ResourceRow
          label="AWS Account &amp; Kubernetes Namespace"
          value="Provisioning"
          status="pending"
          statusLabel="Pending"
          action={<Spinner size="sm" />}
        />
      )}

      {awsAccount?.status === "Completed" && (
        <>
          <ResourceRow
            label="AWS Account"
            value={awsAccount.accountId}
            status="active"
            statusLabel="Active"
          />
          <ResourceRow
            label="Kubernetes Namespace"
            value={awsAccount.namespace}
            status="active"
            statusLabel="Active"
          />
          {awsAccountInformation && (
            <VPCPeerings awsAccountInformation={awsAccountInformation} />
          )}
          <DetailedAwsCountSummary capabilityId={id} />
          <div className="pt-3">
            <TrackedButton
              trackName="ApplicationLogs-ShowDialog"
              size="small"
              variation="outlined"
              onClick={() => setLogModal(true)}
            >
              How to see application logs?
            </TrackedButton>
          </div>
        </>
      )}

      {/* Azure section */}
      <ResourceSectionLabel logo={azureLogo} alt="Azure">
        Azure Resource Groups
      </ResourceSectionLabel>

      {isLoadedAzure && azureResourcesList && azureResourcesList.length > 0 ? (
        azureResourcesList.map((resource) => (
          <ResourceRow
            key={resource.id}
            label="Azure Resource Group"
            value={`rg-dfds_ssu_${resource.environment}_${id}`}
            sub={resource.environment}
            status="active"
            statusLabel="Active"
            action={
              <TrackedLink
                trackName={`AzureResourceGroup-${resource.environment}`}
                href={generateResourceGroupLink(resource.environment)}
                rel="noopener noreferrer"
                target="_blank"
                className="font-mono text-[11px] text-action no-underline hover:underline"
              >
                Open ↗
              </TrackedLink>
            }
          />
        ))
      ) : (
        <EmptyState>
          No Azure Resource Groups linked with this capability.
        </EmptyState>
      )}

      <div className="pt-3">
        <TrackedButton
          trackName="AzureResourceGroup-ShowRequestDialog"
          size="small"
          onClick={() => handleNewAzureResource()}
        >
          Request New Azure Resource Group
        </TrackedButton>
      </div>

      <div className="mt-3 text-[12px] text-muted">
        Refer to the{" "}
        <TrackedLink
          trackName="Wiki-AzureCapabilityDeveloperGuide"
          target="_blank"
          rel="noopener noreferrer"
          href="https://wiki.dfds.cloud/en/documentation/azure/azure-capability-developer"
          className="text-action no-underline hover:underline"
        >
          Azure Capability Developer Guide
        </TrackedLink>{" "}
        for setup instructions.
      </div>
    </>
  );
}
