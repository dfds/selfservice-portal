import { Container, Column, Card } from '@dfds-ui/react-components';
import styles  from "./NotFound.module.css";
import { Text } from '@dfds-ui/typography';

export default function NotFound() {
    // currently not being used because of the new error/notFound banner
    return <>
        <Container>
            <Column m={12} l={12} xl={12} xxl={12}>
                <Card variant="fill" surface="main">
                    <div className={styles.notfound}>
                    <br />

                    <img src="https://media3.giphy.com/media/H54feNXf6i4eAQubud/giphy.gif" alt="angry chicken gif"/>

                    <br />
                    <br />
                    <Text as={"div"} styledAs='heroHeadline'>404 - Capability not found!</Text>
                    </div>
                </Card>
            </Column>
        </Container>
    </>
}