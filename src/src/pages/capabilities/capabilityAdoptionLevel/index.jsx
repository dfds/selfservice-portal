import React, { useEffect, useContext, useState } from "react";
import PageSection from "../../../components/PageSection";
import styles from "./capabilityAdoptionLevel.module.css";
import { Text } from "@dfds-ui/typography";
import {
  StatusSuccess,
  StatusAlert,
  Information,
  Help,
} from "@dfds-ui/icons/system";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import SelfAssessments from "../selfAssessment";
import { TabbedPageSection } from "../../../components/PageSection";
import { TrackedLink } from "@/components/Tracking";

function parseConfigurationLevelInformation(configurationLevelInformation) {
  const recommendations = configurationLevelInformation.breakdown.filter(
    (metric) => !metric.isSelfAssessed,
  );
  const selfAssessments = configurationLevelInformation.breakdown.filter(
    (metric) => metric.isSelfAssessed,
  );
  return [recommendations, selfAssessments];
}

const ConfigurationLevel = {
  UNKNOWN: "UNKNOWN",
  NONE: "NONE",
  PARTIAL: "PARTIAL",
  COMPLETE: "COMPLETE",
};

function MetricRow({ description, level }) {
  var statusIcon = <Help className={styles.levelIndicatorIcon} />;
  switch (level.toUpperCase()) {
    case ConfigurationLevel.NONE:
      statusIcon = (
        <StatusAlert
          className={`${styles.levelIndicatorIcon} ${styles.noAdoption}`}
        />
      );
      break;
    case ConfigurationLevel.PARTIAL:
      statusIcon = (
        <Information
          className={`${styles.levelIndicatorIcon} ${styles.partialAdoption}`}
        />
      );
      break;
    case ConfigurationLevel.COMPLETE:
      statusIcon = (
        <StatusSuccess
          className={`${styles.levelIndicatorIcon} ${styles.completeAdoption}`}
        />
      );
      break;
    default:
      break;
  }

  return (
    <div className={styles.metricRow}>
      <div className={styles.levelIndicator}>{statusIcon}</div>
      <div className={styles.metricRowTextWrapper}>
        <div>
          <div className={styles.metricRowText}>{description}</div>
        </div>
      </div>
    </div>
  );
}

export function CapabilityAdoptionLevel() {
  const [recommendations, setRecommendations] = useState([]);
  const [selfAssessments, setSelfAssessments] = useState([]);
  const { configurationLevelInformation } = useContext(
    SelectedCapabilityContext,
  );

  useEffect(() => {
    if (configurationLevelInformation) {
      const [recommendations, selfAssessments] =
        parseConfigurationLevelInformation(configurationLevelInformation);
      setRecommendations(recommendations);
      setSelfAssessments(selfAssessments);
    }
  }, [configurationLevelInformation]);

  return (
    <>
      {configurationLevelInformation && (
        <PageSection headline="Adoption Level">
          <p>
            Adoption Level is an overview of the current state of the capability
            based on a continuously growing list of recommendations. For an
            in-depth description you can read our{" "}
            <TrackedLink
              trackName="Wiki-CapabilityRecommendations"
              target="_blank"
              rel="noreferrer"
              href="https://wiki.dfds.cloud/en/playbooks/standards/capability_recommendations"
            >
              Guide to Capability Recommendations
            </TrackedLink>
          </p>
          <div className={styles.columnWrapper}>
            <div className={styles.column}>
              <Text styledAs={"smallHeadline"}>Recommendations</Text>
              {(recommendations || []).map((metric) => (
                <MetricRow
                  key={metric.identifier}
                  description={metric.description}
                  suggestion={metric.suggestion}
                  level={metric.level}
                ></MetricRow>
              ))}
            </div>
            <div className={styles.column}>
              <Text styledAs={"smallHeadline"}>Self Assessments</Text>
              {(selfAssessments || []).length == 0 && (
                <Text>
                  No Self Assessments are available in the system at the moment.
                  You do not have to do anything. Huzzah!
                </Text>
              )}
              {(selfAssessments || []).map((metric) => (
                <MetricRow
                  key={metric.identifier}
                  description={metric.description}
                  suggestion={metric.suggestion}
                  level={metric.level}
                ></MetricRow>
              ))}
            </div>
          </div>
        </PageSection>
      )}
    </>
  );
}

export function TabbedCapabilityAdoptionLevel() {
  const header = <></>;
  const footer = <></>;

  const tabs = {
    adoption: "Adoption Level",
    assessments: "Self Assessments",
  };

  const tabsContent = {
    adoption: <CapabilityAdoptionLevel />,
    assessments: <SelfAssessments />,
  };

  return (
    <TabbedPageSection
      headline="Capability Health"
      tabs={tabs}
      tabsContent={tabsContent}
      header={header}
      footer={footer}
    />
  );
}
