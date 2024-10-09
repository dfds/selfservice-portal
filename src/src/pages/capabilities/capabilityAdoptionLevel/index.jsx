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
        <PageSection headline="Capability Health">
          <p>
            Capability Health is based on a continuously growing list of
            recommendations. This overview is an indication of the current state
            of the capability. For an in depth description you can read our{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://wiki.dfds.cloud/en/playbooks/standards/capability_recommendations"
            >
              Guide to Capability Recommendations
            </a>
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
