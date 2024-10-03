import { Text } from "@dfds-ui/typography";
import { Card, CardTitle, CardContent } from "@dfds-ui/react-components";
import styles from "./PageSection.module.css";

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
      {headline && (
        <Text
          as="div"
          styledAs="sectionHeadline"
          className={styles.sectionHeadline}
        >
          {headline} {headlineChildren}
        </Text>
      )}

      <Card variant="fill" surface="main">
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
