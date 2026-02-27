import AppContext from "AppContext";
import React, { useContext, useState } from "react";

import {
  Column,
  Container,
  Hero as DfdsHero,
} from "@dfds-ui/react-components";
import { Link } from "react-router-dom";

import PageSection, { SectionContent } from "components/PageSection";
import Page from "components/Page";
import StatsCounter from "components/StatsCounter";
import styles from "./frontpage.module.css";
import HeroImage from "./hero.jpg";
import LatestNews from "./LatestNews";
import TopVisitors from "./TopVisitors";
import { TextBlock } from "components/Text";
import QuickLinks from "./QuickLinks";
import { useStats } from "@/state/remote/queries/stats";
import { TrackedLink, TrackedLinkButton } from "@/components/Tracking";

function Section({ children }) {
  return <div className={styles.section}>{children}</div>;
}

function Hero() {
  return (
    <div className={styles.herowrapper}>
      <DfdsHero
        title="Welcome to the"
        headline="Developer Portal"
        imageSrc={HeroImage}
      />
    </div>
  );
}

function FunStats() {
  const { data, isFetched } = useStats();

  if (!isFetched || !data) {
    return <></>;
  }

  if (data.length === 0) {
    return <></>;
  }

  return (
    <PageSection>
      <div className={styles.statscontainer}>
        {data.map((x, i) => (
          <StatsCounter key={i} count={x.value} title={x.title} />
        ))}
      </div>
    </PageSection>
  );
}

export default function FrontPage() {
  const { user } = useContext(AppContext);
  const [chatInput, setChatInput] = useState("");

  const name = user ? user.name : "there";

  return (
    <>
      <Page>
        <Section>
          <Hero />
        </Section>

        <Section>
          <FunStats />
        </Section>
      </Page>

      {/*<Section>
          <GrafanaWarning />
        </Section>*/}

      <Container>
        <Column m={3} l={3} xl={3} xxl={3}>
          <PageSection>
            <SectionContent title="Whats happening...?">
              <LatestNews />
            </SectionContent>
          </PageSection>

          <br />

          <PageSection>
            <SectionContent title="Need Help...?">
              <i>Did you know</i> that there is a <strong>Slack</strong> channel
              where you can ask your peers a question and/or answer some of them
              yourself?
              <br />
              <br />
              <TrackedLinkButton
                trackName="SlackArchive-DevPeerSupport"
                title="Click to head on over to Slack..."
                size="small"
                href="slack://dfds.slack.com/archives/C9948TVRC"
                variation="outlined"
              >
                #dev-peer-support
              </TrackedLinkButton>
            </SectionContent>
          </PageSection>
        </Column>

        <Column>
          <PageSection>
            <SectionContent title="Welcome">
              <div id="welcome-content">
                Hello {name}, and welcome to the Developer Portal.
              </div>
              <div
                style={{
                  marginTop: "1em",
                  background: "#fffbe6",
                  border: "1px solid #ffe58f",
                  borderRadius: 4,
                  padding: "1em",
                }}
              >
                <strong>Note:</strong> Invitations to capabilities have been{" "}
                <strong>removed</strong>.<br />
                Having multiple ways to join a capability made it harder for
                people to know what the process was, leading to confusion and
                misunderstandings. Therefore, we have gone back to having just
                one way to join a capability.
              </div>
            </SectionContent>

            <SectionContent title="Capabilities">
              To get started creating a capability, or joining an existing
              please go to <Link to={"/capabilities"}>Capabilities</Link>.
            </SectionContent>

            <SectionContent title="Kafka Topics">
              Want to find an awesome Kafka Topic to consume from? Head on over
              to <Link to={"/topics"}>Topics</Link> and browse amongst all our
              wonderful topics.
              <br />
              <br />
              <i>Hey</i>, are you <strong>.NET'ing</strong> by any chance and
              want to play with Kafka? If so, go check out{" "}
              <TrackedLink
                trackName="Dafda"
                href="https://tniconf.dfds.cloud/dafda/"
              >
                <strong>dafda</strong>
              </TrackedLink>{" "}
              ...you're welcome!
            </SectionContent>

            <SectionContent title="Kubernetes">
              If this is your first visit, please go to{" "}
              <TrackedLink
                trackName="Wiki-KubernetesGettingStarted"
                href="https://wiki.dfds.cloud/en/playbooks/getting-started/journey"
              >
                Kubernetes Getting Started
              </TrackedLink>
              , for information about what to do to get started.
              <br />
              <br />
              Then grab the default Kubernetes config file from the column on
              your right.
            </SectionContent>
          </PageSection>
        </Column>

        <Column m={3} l={3} xl={3} xxl={3}>
          <PageSection>
            <SectionContent title="Quick links">
              <QuickLinks />
            </SectionContent>
          </PageSection>

          <br />

          <PageSection>
            <SectionContent title="KubeConfig..?">
              Are you looking for a fresh config for your{" "}
              <TextBlock>KubeCtl</TextBlock> ?
              <br />
              <br />
              <TrackedLinkButton
                trackName="DownloadKubeConfig"
                size="small"
                href="https://dfds-oxygen-k8s-public.s3-eu-west-1.amazonaws.com/kubeconfig/hellman-saml.config"
                variation="outlined"
              >
                Download
              </TrackedLinkButton>
            </SectionContent>
          </PageSection>

          <br />

          <PageSection>
            <SectionContent title="Top visitors this week">
              <TopVisitors />
            </SectionContent>
          </PageSection>
        </Column>
      </Container>
    </>
  );
}
