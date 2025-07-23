import React, { useState, useEffect } from "react";
import CreationWizard from "@/CreationWizard";
import { Text } from "@dfds-ui/typography";
import { TrackedLink } from "@/components/Tracking";
import Select from "react-select";
import styles from "./resourceInfoBadges.module.css";

export default function AzureResourceGroupRequestWizard({
  inProgress,
  onRequestResourceGroupClicked,
  onCloseClicked,
  azurePurpose,
  azureResourcesList,
}) {
  const steps = [
    {
      title: "Basic Information",
      content: (props) => (
        <BasicInformationStep
          {...props}
          azureResourcesList={azureResourcesList}
        />
      ),
      optional: false,
      skipped: false,
    },
    {
      title: "Summary",
      content: (props) => <SummaryStep {...props} />,
      optional: false,
      skipped: false,
    },
  ];
  const aiSteps = [
    {
      title: "AI Catalogue",
      content: (props) => <AICatalogueStep {...props} />,
      optional: false,
      skipped: false,
    },
    {
      title: "Required AI Tags",
      content: (props) => <MandatoryAITagsStep {...props} />,
      optional: false,
      skipped: false,
    },
  ];
  const insertIndex = 1; // Index where you want to insert the new steps
  const stepsWithAITags = [
    ...steps.slice(0, insertIndex),
    ...aiSteps,
    ...steps.slice(insertIndex),
  ];

  const handleRequestResourceGroupClicked = async (formData) => {
    onRequestResourceGroupClicked({
      ...formData,
    });
  };

  const emptyFormValues = {};

  return (
    <CreationWizard
      isOpen={true}
      onClose={onCloseClicked}
      onComplete={handleRequestResourceGroupClicked}
      steps={azurePurpose === "ai" ? stepsWithAITags : steps}
      title="Request New Azure Resource Group"
      emptyFormValues={emptyFormValues}
      completeInProgress={inProgress}
      completeName={"Request Azure Resource Group"}
    />
  );
}

const BasicInformationStep = ({
  formValues,
  setFormValues,
  setCanContinue,
  azureResourcesList,
}) => {
  const [acceptedCloudUsageGuidelines, setAcceptedCloudUsageGuidelines] =
    useState(formValues.acceptedCloudUsageGuidelines || false);
  const [environment, setEnvironment] = useState(
    formValues.environment || null,
  );
  const availableEnvironments = [
    { value: "dev", label: "Development" },
    { value: "test", label: "Testing" },
    { value: "uat", label: "User Acceptance Testing" },
    { value: "prod", label: "Production" },
  ];
  const [envAvailability, setEnvAvailability] = useState(null);

  useEffect(() => {
    setCanContinue(acceptedCloudUsageGuidelines);
    setFormValues((prevValues) => ({
      ...prevValues,
      acceptedCloudUsageGuidelines: acceptedCloudUsageGuidelines,
    }));
  }, [acceptedCloudUsageGuidelines]);

  useEffect(() => {
    if (azureResourcesList != null) {
      setEnvAvailability(() => {
        const copy = [...azureResourcesList];
        var payload = [];
        availableEnvironments.forEach((env) => {
          const found = copy.find((x) => x.environment === env.value);
          if (found) {
            payload.push({ env: env, exist: true });
          } else {
            payload.push({ env: env, exist: false });
          }
        });
        return payload;
      });
    }
  }, [azureResourcesList]);

  useEffect(() => {
    if (environment != null && environment !== undefined) {
      setFormValues((prevValues) => ({
        ...prevValues,
        environment: environment,
      }));
    }
  }, [environment]);

  useEffect(() => {
    if (
      environment != null &&
      environment !== undefined &&
      acceptedCloudUsageGuidelines
    ) {
      setCanContinue(true);
    } else {
      setCanContinue(false);
    }
  }, [acceptedCloudUsageGuidelines, environment]);

  return (
    <>
      <h1>Basic Information</h1>

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
      <div className={styles.separator} />
      <Text>
        Also please confirm that you have read and understood{" "}
        <TrackedLink
          trackName="Wiki-CloudUsageGuidelines"
          target="_blank"
          rel="noopener noreferrer"
          href="https://wiki.dfds.cloud/en/architecture/Architectural-Decision-Records-ADRS/which-cloud"
        >
          the DFDS Cloud Usage Guidelines
        </TrackedLink>
        .
      </Text>
      <Text>
        This document outlines what use cases are permitted for Azure, for
        Vercel, and for AWS.
      </Text>
      <div className={styles.indent20}>
        <input
          type="checkbox"
          checked={acceptedCloudUsageGuidelines}
          style={{ marginRight: "5px" }}
          onChange={() => {
            setAcceptedCloudUsageGuidelines(!acceptedCloudUsageGuidelines);
          }}
        />
        <label>I have read the Cloud Usage Guidelines</label>
      </div>

      <div className={styles.separator} />
      <Text>
        Please select the environment for which you want to create the Azure
        resource group.
      </Text>
      <Text>
        You can only create a resource group for an environment that does not
        already have one.
      </Text>

      <div className={styles.indent20}>
        {envAvailability != null ? (
          <>
            <label htmlFor="environment-select">Choose an environment:</label>
            <Select
              id="environment-select"
              className={styles.environmentselect}
              options={envAvailability.map((env) => ({
                value: env.env.value,
                label: env.env.label,
                isDisabled: env.exist,
              }))}
              value={{ value: environment?.value, label: environment?.label }}
              onChange={(selection) => {
                setEnvironment(selection);
              }}
            ></Select>
          </>
        ) : (
          <>
            <div>error</div>
          </>
        )}
      </div>
    </>
  );
};

const AICatalogueStep = ({ formValues, setFormValues, setCanContinue }) => {
  const [aiPolicyAccepted, setAiPolicyAccepted] = useState(
    formValues.aiPolicyAccepted || false,
  );
  const [existingCatalogueChecked, setExistingCatalogueChecked] = useState(
    formValues.existingCatalogueChecked || false,
  );
  const [catalogueId, setCatalogueId] = useState(
    formValues.catalogueId || null,
  );

  useEffect(() => {
    setFormValues((prevValues) => ({
      ...prevValues,
      catalogueId: catalogueId,
    }));
  }, [catalogueId]);

  useEffect(() => {
    setFormValues((prevValues) => ({
      ...prevValues,
      aiPolicyAccepted: aiPolicyAccepted,
    }));
  }, [aiPolicyAccepted]);

  useEffect(() => {
    setFormValues((prevValues) => ({
      ...prevValues,
      existingCatalogueChecked: existingCatalogueChecked,
    }));
  }, [existingCatalogueChecked]);

  useEffect(() => {
    if (
      catalogueId !== null &&
      catalogueId !== "" &&
      aiPolicyAccepted &&
      existingCatalogueChecked
    ) {
      setCanContinue(true);
    } else {
      setCanContinue(false);
    }
  }, [catalogueId, aiPolicyAccepted, existingCatalogueChecked]);

  return (
    <>
      <h1>DFDS AI Catalogue</h1>
      <Text>
        You have selected to create an Azure resource group for AI purposes.
      </Text>
      <Text>
        Please answer the following questions to ensure compliance with DFDS AI
        policies:
      </Text>

      <div className={styles.indent20}>
        <input
          type="checkbox"
          checked={aiPolicyAccepted}
          style={{ marginRight: "5px" }}
          onChange={() => {
            setAiPolicyAccepted(!aiPolicyAccepted);
          }}
        />
        <label>
          I have read the{" "}
          <TrackedLink
            trackName="Sharepoint-AIPolicy"
            target="_blank"
            rel="noopener noreferrer"
            href="https://dfds.sharepoint.com/sites/AI/SitePages/AI_Policy.aspx"
          >
            DFDS AI Policy
          </TrackedLink>
          .
        </label>
      </div>

      <div className={styles.separator} />

      <Text>
        DFDS maintains a catalogue of AI resources that you can find{" "}
        <TrackedLink
          trackName="Sharepoint-AICatalogue"
          target="_blank"
          rel="noopener noreferrer"
          href="https://dfds.sharepoint.com/sites/DataAnalyticsCommunity/Lists/AI%20Catalogue/AllItems.aspx?sortField=DFDSDeveloped&isAscending=true&viewid=5b58d3e2%2Deaa7%2D4021%2D931a%2D2ab9c8ee3685&ovuser=73a99466%2Dad05%2D4221%2D9f90%2De7142aa2f6c1%2Cshiypen%40dfds%2Ecom&OR=Teams%2DHL&CT=1753261542079&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI0OS8yNTA3MDMxODgwNiIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D"
        >
          here
        </TrackedLink>
        .
      </Text>
      <Text>
        Please ensure that you have checked the catalogue for existing resources
        matching your requirements before creating a new one.
      </Text>

      <div className={styles.indent20}>
        <input
          id="existing-catalogue-checkbox"
          type="checkbox"
          checked={existingCatalogueChecked}
          style={{ marginRight: "5px" }}
          onChange={() => {
            setExistingCatalogueChecked(!existingCatalogueChecked);
          }}
        />
        <label htmlFor="existing-catalogue-checkbox">
          I have checked the existing catalogue for AI resources
        </label>
      </div>

      <div className={styles.separator} />
      <Text>
        If no existing resource matches your requirements, please add the use
        case of this resource into the{" "}
        <TrackedLink
          trackName="Sharepoint-AICatalogue"
          target="_blank"
          rel="noopener noreferrer"
          href="https://dfds.sharepoint.com/sites/DataAnalyticsCommunity/Lists/AI%20Catalogue/AllItems.aspx?sortField=DFDSDeveloped&isAscending=true&viewid=5b58d3e2%2Deaa7%2D4021%2D931a%2D2ab9c8ee3685&ovuser=73a99466%2Dad05%2D4221%2D9f90%2De7142aa2f6c1%2Cshiypen%40dfds%2Ecom&OR=Teams%2DHL&CT=1753261542079&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI0OS8yNTA3MDMxODgwNiIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D"
        >
          AI Catalogue
        </TrackedLink>
        .
      </Text>
      <Text>Then provide the Catalogue ID below.</Text>
      <div className={styles.indent20}>
        <label htmlFor="catalogue-id-input">Catalogue ID:</label>
        <input
          id="catalogue-id-input"
          className={styles.catalogueId}
          type="text"
          placeholder="AI Catalogue Item ID"
          value={catalogueId || ""}
          onChange={(e) => {
            setCatalogueId(e.target.value);
          }}
        />
      </div>
    </>
  );
};

const MandatoryAITagsStep = ({ formValues, setFormValues, setCanContinue }) => {
  const [riskCategory, setRiskCategory] = useState(
    formValues.riskCategory || null,
  );
  const riskCategories = [
    { label: "High Risk", value: "high" },
    { label: "Limited Risk", value: "limited" },
    { label: "Minimal Risk", value: "minimal" },
    { label: "Not Applicable", value: "notapplicable" },
  ];
  const [gdprData, setGdprData] = useState(formValues.gdprData || null);
  const gdprOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  useEffect(() => {
    setFormValues((prevValues) => ({
      ...prevValues,
      riskCategory: riskCategory,
    }));
  }, [riskCategory]);

  useEffect(() => {
    setFormValues((prevValues) => ({
      ...prevValues,
      gdprData: gdprData,
    }));
  }, [gdprData]);

  useEffect(() => {
    if (riskCategory !== null && gdprData !== null) {
      setCanContinue(true);
    } else {
      setCanContinue(false);
    }
  }, [riskCategory, gdprData]);

  return (
    <>
      <h1>Required AI Tags</h1>
      <Text>
        Azure resource groups meant for AI purposes must be tagged with the
        following tags:
      </Text>

      <div className={styles.separator} />

      <Text>
        Use{" "}
        <TrackedLink
          trackName="Forms-AIQuestionnaire"
          target="_blank"
          rel="noopener noreferrer"
          href="https://forms.office.com/pages/responsepage.aspx?id=ZpSpcwWtIUKfkOcUKqL2wRhXoqzx_FRMrf1WtWERJbpUOUxUSTZQMFEwRE9TSTJVM09NRlNVWlRJUy4u&route=shorturl"
        >
          this questionnaire
        </TrackedLink>{" "}
        to determine the risk category of your AI resource.
      </Text>
      <div className={styles.envsection}>
        <div className={styles.indent20}>
          <label htmlFor="risk-category-select">Risk Category:</label>
          <Select
            id="risk-category-select"
            className={styles.environmentselect}
            options={riskCategories.map((risk) => ({
              value: risk.value,
              label: risk.label,
            }))}
            value={riskCategory}
            onChange={(selection) => {
              setRiskCategory(selection);
            }}
          ></Select>
        </div>
      </div>

      <div className={styles.separator} />

      <Text>Does this AI use Personal Data in Processing?</Text>
      <div className={styles.envsection}>
        <div className={styles.indent20}>
          <label htmlFor="gdpr-select">GDPR Data will be processed:</label>
          <Select
            id="gdpr-select"
            className={styles.environmentselect}
            options={gdprOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            value={gdprData}
            onChange={(selection) => {
              setGdprData(selection);
            }}
          ></Select>
        </div>
      </div>
    </>
  );
};

const SummaryStep = ({ formValues, setFormValues }) => {
  return (
    <>
      <h1>Summary</h1>
      {/* Display the summary of the form values */}
      <pre>{JSON.stringify(formValues, null, 2)}</pre>
    </>
  );
};
