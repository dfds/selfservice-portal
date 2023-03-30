import { Hero } from '@dfds-ui/react-components';
import { Container, Column, Card, CardTitle, CardContent, LinkButton  } from '@dfds-ui/react-components';
import { Link } from "react-router-dom";

import styles from "./frontpage.module.css";

import AppContext from "./../../app-context";
import { useContext } from 'react';

export default function FrontPage() {
    const { user } = useContext(AppContext);

    const name = user
        ? user.name
        : "there"
    const kubeConfigS3url= "https://dfds-oxygen-k8s-public.s3-eu-west-1.amazonaws.com/kubeconfig/hellman-saml.config";
    return <>
        <Container>
            <Column m={12} l={12} xl={12} xxl={12}>
                <div className={styles.herowrapper}>
                    <Hero
                        title="Welcome to the cloud"
                        headline="Self Service Portal"
                        //   imageSrc="https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                        imageSrc="https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg"
                    />
                </div>

                <br />

                <Card variant="fill" surface="main">
                    <Container>
                        <Column>
                            <CardTitle>Welcome</CardTitle>
                            <CardContent>
                                Hello {name}, and welcome to the Cloud Self Service portal.
                            </CardContent>

                            <CardTitle>Capabilities</CardTitle>
                            <CardContent>
                                To get started creating a capability, or joining an existing please go to <Link to={"/capabilities"} >Capabilities</Link>.
                            </CardContent>

                            <CardTitle>Kubernetes</CardTitle>
                            <CardContent>
                                Below is a collection of resources for getting started on the Kubernetes platform. <br />
                                If this is your first visit, please go to <a href='https://wiki.dfds.cloud/en/playbooks/getting-started/journey'>Kubernetes Getting Started</a>, for information about what to do to get started. <br />
                                Then grab the default Kubernetes config file (information about location, etc., is also available in the link above): <br /><br />
                                <LinkButton size='small' href={kubeConfigS3url} variation="outlined">Get Kubernetes config</LinkButton >
                            </CardContent>
                        </Column>
                    </Container>
                </Card>
            </Column>

        </Container>
    </>
}