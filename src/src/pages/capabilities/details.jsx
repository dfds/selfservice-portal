import React, { useContext, useEffect, useState, useRef, act } from "react";
import { useParams, useLocation } from "react-router-dom";
import SelectedCapabilityContext from "./SelectedCapabilityContext";
import { TabbedMembersView } from "./members";
import Summary from "./summary";
import Costs from "./costs";
import Resources from "./resources";
import KafkaCluster from "./KafkaCluster";
import Page from "components/Page";
import PageSection from "components/PageSection";
import { Text } from "@dfds-ui/typography";
import { SelectedCapabilityProvider } from "./SelectedCapabilityContext";
import DeletionWarning from "./deletionWarning";
import CapabilityManagement from "./capabilityManagement";
import { JsonSchemaProvider } from "../../JsonSchemaContext";
import { CapabilityTagsPageSection } from "./capabilityTags";
import menustyles from "./menu.module.css";

export default function CapabilityDetailsPage() {
  return (
    <>
      <SelectedCapabilityProvider>
        <JsonSchemaProvider>
          <CapabilityDetailsPageContent />
        </JsonSchemaProvider>
      </SelectedCapabilityProvider>
    </>
  );
}

function CapabilityDetailsPageContent() {
  const { id } = useParams();
  const { hash } = useLocation();
  const {
    links,
    isLoading,
    isFound,
    name,
    kafkaClusters,
    loadCapability,
    showCosts,
    isPendingDeletion,
    isDeleted,
    updateDeletionStatus,
    awsAccount,
    metadata,
  } = useContext(SelectedCapabilityContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCapability(id);
  }, [id]);

  const pagetitle = isDeleted ? `${name} [Deleted]` : name;

  const [showJsonMetadata, setShowJsonMetadata] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [costCentre, setCostCentre] = useState("");

  const [activeId, setActiveId] = useState("");
  const [autoscrolling, setAutoscrolling] = useState(false);
  const autoScrollRef = useRef(autoscrolling);
  const autoScrollingTimerRef = useRef(null);

  useEffect(() => {
    if (
      (links?.metadata?.allow || []).includes("GET") &&
      (links?.metadata?.allow || []).includes("POST")
    ) {
      setShowJsonMetadata(true);
    }
  }, [links]);

  useEffect(() => {
    if ((links?.sendInvitations?.allow || []).includes("POST")) {
      setShowInvitations(true);
    }
  }, [links]);

  useEffect(() => {
    if (metadata && metadata !== "{}") {
      const parsedMetadata = JSON.parse(metadata);
      setCostCentre(parsedMetadata["dfds.cost.centre"]);
    }
  }, [metadata]);


  /*
  const scrollToSection = (id) => {
    console.log("scroll to section", id);
    if (!id) return;
    setAutoscrolling(true);
    clearTimeout(autoScrollingTimerRef.current);
    autoScrollingTimerRef.current = setTimeout(() => {
      setAutoscrolling(false);
    }, 1500); // disable autoscrolling after 1.5 seconds
    // wait for the target to be rendered
    let attempts = 0;
    const maxAttempts = 20; // stop after ~2 seconds
    const interval = setInterval(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add(menustyles.highlight);
        setTimeout(() => el.classList.remove(menustyles.highlight), 3000);
        clearInterval(interval);
      } else if (attempts > maxAttempts) {
        clearInterval(interval);
      }
      attempts++;
    }, 100); // check every 100ms
  };


  useEffect(() => {
    autoScrollRef.current = autoscrolling;
  }, [autoscrolling]);

  useEffect(() => {
    console.log("hash changed", hash);
    if (!hash) return;
    setActiveId(hash.substring(1));
    setTimeout(() => {
      scrollToSection(hash.substring(1));
    }, 800); // give time to render and expand sections before scrolling
  }, [hash]);
  */

  useEffect(() => {
    if (!activeId || activeId === "") return;
    history.replaceState(null, "", `#${activeId}`);
  }, [activeId]);

  /*
  const handleHighlight = (e, id) => {
    console.log("handle highlight", hash);
    e.preventDefault();
    setActiveId(id);
    scrollToSection(id);
  };
  */

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const scrollPosition = window.pageYOffset;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 60; // Adjust for page menu
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          if (!autoScrollRef.current) {
            setActiveId(section.id);
            window.history.replaceState(null, null, `#${section.id}`);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div>
        <DeletionWarning
          deletionState={isPendingDeletion}
          updateDeletionState={updateDeletionStatus}
        />

        {/*<nav className={menustyles.menu}>
          <a
            href="#summary"
            className={activeId === "summary" ? menustyles.active : ""}
            onClick={(e) => handleHighlight(e, "summary")}
          >
            Summary
          </a>
          <a
            href="#members"
            className={activeId === "members" ? menustyles.active : ""}
            onClick={(e) => handleHighlight(e, "members")}
          >
            Members
          </a>
          <a
            href="#tags"
            className={activeId === "tags" ? menustyles.active : ""}
            onClick={(e) => handleHighlight(e, "tags")}
          >
            Tags
          </a>
          <a
            href="#resources"
            className={activeId === "resources" ? menustyles.active : ""}
            onClick={(e) => handleHighlight(e, "resources")}
          >
            Resources
          </a>
          <a
            href="#kafka"
            className={activeId === "kafka" ? menustyles.active : ""}
            onClick={(e) => handleHighlight(e, "kafka")}
          >
            Kafka Clusters
          </a>
          {showCosts && awsAccount !== undefined && (
            <a
              href="#costs"
              className={activeId === "costs" ? menustyles.active : ""}
              onClick={(e) => handleHighlight(e, "costs")}
            >
              Costs
            </a>
          )}
          <a
            href="#management"
            className={activeId === "management" ? menustyles.active : ""}
            onClick={(e) => handleHighlight(e, "management")}
          >
            Management
          </a>
        </nav>*/}

        <Page title={pagetitle} isLoading={isLoading} isNotFound={!isFound}>
          <Summary anchorId="summary" />

          <TabbedMembersView
            anchorId="members"
            showInvitations={showInvitations}
          />

          {/*<TabbedCapabilityAdoptionLevel />*/}

          {showJsonMetadata && <CapabilityTagsPageSection anchorId="tags" />}

          {/*showJsonMetadata && <MetadataTabbedView />*/}

          <Resources anchorId="resources" capabilityId={id} />

          {/* <Logs /> */}
          {/* <CommunicationChannels /> */}

          {!awsAccount && (
            <PageSection id="kafka" headline="Kafka Clusters">
              <Text>
                No AWS account is linked to this capability. Please link an AWS
                account to view Kafka clusters.
              </Text>
            </PageSection>
          )}
          <section id="kafka">
            {awsAccount !== undefined &&
              awsAccount &&
              (kafkaClusters || []).map((cluster) => (
                <KafkaCluster
                  key={cluster.id}
                  cluster={cluster}
                  capabilityId={id}
                />
              ))}
          </section>

          {showCosts && awsAccount !== undefined && (
            <Costs anchorId="costs" costCentre={costCentre} />
          )}

          {!isDeleted && (
            <CapabilityManagement
              anchorId="management"
              deletionState={isPendingDeletion}
              updateDeletionState={updateDeletionStatus}
            />
          )}
        </Page>
      </div>
      <br />
    </>
  );
}
