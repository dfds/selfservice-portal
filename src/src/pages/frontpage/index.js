import AppContext from "AppContext";
import { useContext } from 'react';

import { Column, Container, Hero as DfdsHero, LinkButton } from '@dfds-ui/react-components';
import { Link } from "react-router-dom";

import PageSection, { SectionContent } from 'components/PageSection';
import Page from 'components/Page';
import StatsCounter from 'components/StatsCounter';
import styles from "./frontpage.module.css";
import HeroImage from "./hero.jpg";
import LatestNews from "./LatestNews";

function Section({children}) {
    return <div className={styles.section}>{children}</div>
}

function Hero() {
    return <div className={styles.herowrapper}>
        <DfdsHero
            title="Welcome to the"
            headline="Developer Portal"
            imageSrc={HeroImage}
        />
    </div>
}

function FunStats() {
    const { stats } = useContext(AppContext);

    if (stats.length === 0) {
        return <></>
    }

    return <PageSection>
        <div className={styles.statscontainer}>
            {stats.map((x,i) => <StatsCounter key={i} count={x.value} title={x.title} />)}
        </div>
    </PageSection>
}

export default function FrontPage() {
    const { user} = useContext(AppContext);

    const name = user
        ? user.name
        : "there"

    return <>
        <Page>
            <Section>
                <Hero />
            </Section>

            <Section>
                <FunStats />
            </Section>

            <Section>
                <Container>
                    <Column>
                        <PageSection>
                            <SectionContent title="Welcome">
                                Hello {name}, and welcome to the Developer Portal.
                            </SectionContent>

                            <SectionContent title="Capabilities">
                                To get started creating a capability, or joining an existing please go to <Link to={"/capabilities"} >Capabilities</Link>.
                            </SectionContent>

                            <SectionContent title="Kubernetes">
                                Below is a collection of resources for getting started on the Kubernetes platform. <br />
                                If this is your first visit, please go to <a href='https://wiki.dfds.cloud/en/playbooks/getting-started/journey'>Kubernetes Getting Started</a>, for information about what to do to get started. <br />
                                Then grab the default Kubernetes config file (information about location, etc., is also available in the link above): <br /><br />
                                
                                <LinkButton 
                                    size='small' 
                                    href="https://dfds-oxygen-k8s-public.s3-eu-west-1.amazonaws.com/kubeconfig/hellman-saml.config" 
                                    variation="outlined">
                                        Get Kubernetes config
                                </LinkButton >

                                <br />
                                <br />
                                
                            </SectionContent>
                        </PageSection>
                    </Column>
                    <Column m={4} l={4} xl={4} xxl={4}>
                        <PageSection>
                            <SectionContent title="Whats happening...?">
                                <LatestNews />
                            </SectionContent>
                        </PageSection>
                    </Column>
                </Container>
            </Section>
        </Page>
    </>
}