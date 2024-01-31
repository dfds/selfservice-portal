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
  const keyMetrics = configurationLevelInformation.breakdown.filter(
    (metric) => metric.isFocusMetric,
  );
  const generalGuidance = configurationLevelInformation.breakdown.filter(
    (metric) => !metric.isFocusMetric,
  );
  return [keyMetrics, generalGuidance];
}

const ConfigurationLevel = {
  NONE: "NONE",
  PARTIAL: "PARTIAL",
  COMPLETE: "COMPLETE",
};

function MetricRow({ description, suggestion, level }) {
  var showSuggestion = true;
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
      showSuggestion = false;
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
          {showSuggestion && (
            <div
              className={`${styles.metricRowText} ${styles.metricRowSuggestion}`}
            >
              Suggestion: {suggestion}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CapabilityAdoptionLevel() {
  const [keyMetrics, setKeyMetrics] = useState([]);
  const [generalGuidance, setGeneralGuidance] = useState([]);
  const { configurationLevelInformation } = useContext(
    SelectedCapabilityContext,
  );

  useEffect(() => {
    if (configurationLevelInformation) {
      const [keyMetrics, generalGuidance] = parseConfigurationLevelInformation(
        configurationLevelInformation,
      );
      setKeyMetrics(keyMetrics);
      setGeneralGuidance(generalGuidance);
    }
  }, [configurationLevelInformation]);

  return (
    <>
      {configurationLevelInformation && (
        <PageSection headline="Adoption Level">
          <div className={styles.columnWrapper}>
            <div className={styles.column}>
              <Text styledAs={"smallHeadline"}>Key Metrics</Text>
              {(keyMetrics || []).map((metric) => (
                <MetricRow
                  key={metric.identifier}
                  description={metric.description}
                  suggestion={metric.suggestion}
                  level={metric.level}
                ></MetricRow>
              ))}
            </div>
            <div className={styles.column}>
              <Text styledAs={"smallHeadline"}>General Guidance</Text>
              {(generalGuidance || []).map((metric) => (
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
