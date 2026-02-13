import React, { useContext, useEffect } from "react";
import PageSection from "components/PageSection";
import styles from "./RequirementsStatus.module.css";
import SelectedCapabilityContext from "./SelectedCapabilityContext";

// Helper to get color based on score
function getScoreColor(score) {
  if (score < 40) return "#f44336"; // red
  if (score < 50) return "#ff9800"; // orange
  if (score < 60) return "#ffeb3b"; // yellow
  if (score < 70) return "#cddc39"; // lime
  if (score < 80) return "#8bc34a"; // light green
  if (score < 90) return "#4caf50"; // green
  if (score < 95) return "#388e3c"; // darker green
  return "#1b5e20"; // very dark green
}

function LightBulb({ score, size = 20 }) {
  const color = getScoreColor(score);
  return (
    <span
      title={`Score: ${score}`}
      style={{
        display: "inline-block",
        marginRight: 8,
        verticalAlign: "middle",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow:
            "0 2px 8px 2px rgba(0,0,0,0.18), 0 0 8px 2px rgba(255,255,180,0.25)",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: size * 0.1,
            left: size * 0.2,
            width: size * 0.6,
            height: size * 0.3,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.5)",
            filter: "blur(0.5px)",
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            bottom: size * 0.1,
            left: size * 0.3,
            width: size * 0.4,
            height: size * 0.2,
            borderRadius: "50%",
            background: "rgba(255,255,180,0.3)",
            filter: "blur(1px)",
            pointerEvents: "none",
          }}
        />
      </span>
    </span>
  );
}

export default function RequirementsScore() {
  const { requirementsScore } = useContext(SelectedCapabilityContext);

  const [overallScore, setOverallScore] = React.useState(0);
  const [individualScores, setIndividualScores] = React.useState([]);

  useEffect(() => {
    if (requirementsScore && Object.keys(requirementsScore).length !== 0) {
      setOverallScore(requirementsScore.totalScore);
      setIndividualScores(requirementsScore.requirementScores);
    }
  }, [requirementsScore]);

  return (
    <PageSection id="requirements-status" headline="Requirements Status">
      <div className={styles.overallScoreRow}>
        <span className={styles.overallScoreBulb}>
          <LightBulb score={overallScore} size={32} />
        </span>
        <span className={styles.overallScoreLabel}>Overall Score:</span>
        <span className={styles.overallScoreValue}>{overallScore} / 100</span>
      </div>
      <div className={styles.individualScoresTitle}>
        Individual Requirement Scores
      </div>
      <div className={styles.individualScores}>
        {individualScores &&
          individualScores.map((score) => (
            <div
              key={score.requirementId}
              className={styles.individualScoreItem}
            >
              <div className={styles.individualScoreHeader}>
                <span className={styles.individualScoreBulb}>
                  <LightBulb score={score.score} size={20} />
                </span>
                <span className={styles.individualScoreLabel}>
                  {score.title}
                </span>
                <span className={styles.individualScoreValue}>
                  {score.score} / 100
                </span>
              </div>
              <div className={styles.scoreDescription}>
                {score.description}
                <div className={styles.requirementLinkBox}>
                  <a
                    href="https://wiki.dfds.cloud/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Learn more about requirements"
                    style={{ textDecoration: "none" }}
                  >
                    <span className={styles.requirementLinkIcon}>
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        style={{ display: "block" }}
                      >
                        <rect
                          x="3"
                          y="3"
                          width="14"
                          height="14"
                          rx="2.5"
                          fill="#e0e0e0"
                          stroke="#444"
                          strokeWidth="1"
                        />
                        <rect
                          x="5"
                          y="5"
                          width="10"
                          height="10"
                          rx="1.5"
                          fill="#fff"
                          stroke="#bbb"
                          strokeWidth="0.7"
                        />
                        <rect
                          x="7"
                          y="7"
                          width="6"
                          height="1.2"
                          fill="#888"
                          rx="0.6"
                        />
                        <rect
                          x="7"
                          y="9"
                          width="6"
                          height="1.2"
                          fill="#bbb"
                          rx="0.6"
                        />
                        <g>
                          <path
                            d="M15.5 6.5V4.5H13.5"
                            stroke="#444"
                            strokeWidth="1.1"
                            strokeLinecap="round"
                          />
                          <path
                            d="M15.5 4.5L11 9"
                            stroke="#444"
                            strokeWidth="1.1"
                            strokeLinecap="round"
                          />
                        </g>
                      </svg>
                    </span>
                    <span className={styles.requirementLinkText}>
                      read more
                    </span>
                  </a>
                </div>
              </div>
            </div>
          ))}
      </div>
    </PageSection>
  );
}
