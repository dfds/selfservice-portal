import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';

export default function PageSection({headline, children}) {
    return <div>
        <Text styledAs='sectionHeadline'>{headline}</Text>
        <Card variant="fill" surface="main">
            <CardContent>
                {children}
            </CardContent>
        </Card>
    </div>
}