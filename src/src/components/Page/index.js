import { H1 } from '@dfds-ui/react-components';
import { Text } from '@dfds-ui/typography';
import { Container, Column, DfdsLoader } from '@dfds-ui/react-components';
import NotFound from './NotFound';

export default function Page({title, isLoading = false, isNotFound = false, children}) {
    if (isLoading) {
        return <DfdsLoader showMenu={true} label="Loading..." />
    }

    if (isNotFound) {
        return <NotFound />
    }

    return <>
        <br/>
        <br/>

        <Container>
            <Column m={12} l={12} xl={12} xxl={12}>
                <Text as={H1} styledAs='heroHeadline'>{title}</Text>
                {children}
            </Column>
        </Container>
    </>
}