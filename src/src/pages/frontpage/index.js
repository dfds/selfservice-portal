import { Hero } from '@dfds-ui/react-components';
import { Container, Column, Card, CardTitle, CardContent, LinkButton  } from '@dfds-ui/react-components';
import { Link } from "react-router-dom";

import styles from "./frontpage.module.css";

export default function FrontPage() {
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
                    <CardTitle>Welcome</CardTitle>
                    <CardContent>
                        Hello John Doe, and welcome to the Cloud Self Service portal.
                    </CardContent>

                    <CardTitle>Capabilities</CardTitle>
                    <CardContent>
                        To get started creating a capability, or joining an existing please go to <Link to={"/capabilities"} >Capabilities</Link>.
                    </CardContent>

                    <CardTitle>Kubernetes</CardTitle>
                    <CardContent>
                        <p>Below is a collection of resources for getting started on the Kubernetes platform.</p>
                        <p>If this is your first visit, please go to <a href='https://wiki.dfds.cloud/en/playbooks/getting-started/journey'>Kubernetes Getting Started</a>, for information about what to do to get started.</p>
                        <p>Then grab the default Kubernetes config file (information about location, etc., is also available in the link above):</p>
                        <LinkButton size='small' href="lala" variation="outlined">Get Kubernetes config</LinkButton >
                    </CardContent>
                </Card>

            </Column>
        </Container>
    </>
}