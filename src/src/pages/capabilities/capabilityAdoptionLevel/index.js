import React, { useEffect, useContext, useState } from "react";
import PageSection from "../../../components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import styles from "./capabilityAdoptionLevel.module.css";
import { Text } from "@dfds-ui/typography";

function parseAdoptionLevelInformation(adoptionLevelInformation) {
  const keyMetrics = adoptionLevelInformation.metrics.filter(
    (metric) => metric.isFocusMetric,
  );
  const generalGuidance = adoptionLevelInformation.metrics.filter(
    (metric) => !metric.isFocusMetric,
  );
  return [keyMetrics, generalGuidance];
}

function MetricRow({ description, suggestion, level }) {
  var showSuggestion = true;
  var statusColor = "unknown";
  switch (level) {
    case "NONE":
      statusColor = "none";
      break;
    case "PARTIAL":
      statusColor = "partial";
      break;
    case "COMPLETE":
      statusColor = "complete";
      showSuggestion = false;
      break;
    default:
      break;
  }

  return (
    <div className={styles.metricRow}>
      <div className={`${styles.levelIndicator} ${styles[statusColor]}`} />
      <div className={styles.metricRowTextWrapper}>
        <div>
          <div className={styles.metricRowText}>{description}</div>
          {showSuggestion && (
            <div
              className={`${styles.metricRowText} ${styles.metricRowSuggestion}`}
            >
              {suggestion}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CapabilityAdoptionLevel() {
  // does set update the backend? How is this done in the metadata view?
  const { adoptionLevelInformation } = useContext(SelectedCapabilityContext);

  const [keyMetrics, setKeyMetrics] = useState([]);
  const [generalGuidance, setGeneralGuidance] = useState([]);

  useEffect(() => {
    if (adoptionLevelInformation) {
      const [keyMetrics, generalGuidance] = parseAdoptionLevelInformation(
        adoptionLevelInformation,
      );
      setKeyMetrics(keyMetrics);
      setGeneralGuidance(generalGuidance);
    }
  }, [adoptionLevelInformation]);

  useEffect(() => {
    console.log(generalGuidance);
  }, [generalGuidance]);

  return (
    <>
      <PageSection headline="Adoption Level">
        <div className={styles.columnWrapper}>
          <div className={styles.column}>
            <Text styledAs={"smallHeadline"}>Key Metrics</Text>
            {(keyMetrics || []).map((metric) => (
              <MetricRow
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
                description={metric.description}
                suggestion={metric.suggestion}
                level={metric.level}
              ></MetricRow>
            ))}
          </div>
        </div>
      </PageSection>
    </>
  );
}
