import { Text } from "@dfds-ui/typography";
import { Card, CardTitle, CardContent } from "@dfds-ui/react-components";

export function SectionContent({ title, children }) {
  return (
    <>
      {title && <CardTitle>{title}</CardTitle>}

      <CardContent>{children}</CardContent>
    </>
  );
}

export default function PageSection({ headline, headlineChildren, children }) {
  return (
    <div>
      {headline && <Text styledAs="sectionHeadline">{headline} {headlineChildren}</Text>}

      <Card variant="fill" surface="main">
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
