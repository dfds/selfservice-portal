import AppContext from "AppContext";
import { useContext } from "react";

import {
  Column,
  Container,
  Hero as DfdsHero,
  LinkButton,
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
  const { stats } = useContext(AppContext);

  if (stats.length === 0) {
    return <></>;
  }

  return (
    <PageSection>
      <div className={styles.statscontainer}>
        {stats.map((x, i) => (
          <StatsCounter key={i} count={x.value} title={x.title} />
        ))}
      </div>
    </PageSection>
  );
}

export default function FrontPage() {
  const { user } = useContext(AppContext);

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

        <Section>
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
                  <i>Did you know</i> that there is a <strong>Slack</strong>{" "}
                  channel where you can ask your peers a question and/or answer
                  some of them yourself?
                  <br />
                  <br />
                  <LinkButton
                    title="Click to head on over to Slack..."
                    size="small"
                    href="slack://dfds.slack.com/archives/C9948TVRC"
                    variation="outlined"
                  >
                    #dev-peer-support
                  </LinkButton>
                </SectionContent>
              </PageSection>
            </Column>

            <Column>
              <PageSection>
                <SectionContent title="Welcome">
                  Hello {name}, and welcome to the Developer Portal.
                </SectionContent>

                <SectionContent title="Capabilities">
                  To get started creating a capability, or joining an existing
                  please go to <Link to={"/capabilities"}>Capabilities</Link>.
                </SectionContent>

                <SectionContent title="Kafka Topics">
                  Want to find an awesome Kafka Topic to consume from? Head on
                  over to <Link to={"/topics"}>Topics</Link> and browse amongst
                  all our wonderful topics.
                  <br />
                  <br />
                  <i>Hey</i>, are you <strong>.NET'ing</strong> by any chance
                  and want to play with Kafka? If so, go check out{" "}
                  <a href="https://tniconf.dfds.cloud/dafda/">
                    <strong>dafda</strong>
                  </a>{" "}
                  ...you're welcome!
                </SectionContent>

                <SectionContent title="Kubernetes">
                  If this is your first visit, please go to{" "}
                  <a href="https://wiki.dfds.cloud/en/playbooks/getting-started/journey">
                    Kubernetes Getting Started
                  </a>
                  , for information about what to do to get started.
                  <br />
                  <br />
                  Then grab the default Kubernetes config file from the column
                  on your right.
                  <br />
                  <br />
                  <br />
                  <i>Enjoy!</i>
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
                  <LinkButton
                    size="small"
                    href="https://dfds-oxygen-k8s-public.s3-eu-west-1.amazonaws.com/kubeconfig/hellman-saml.config"
                    variation="outlined"
                  >
                    Download
                  </LinkButton>
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
        </Section>
      </Page>
    </>
  );
}
