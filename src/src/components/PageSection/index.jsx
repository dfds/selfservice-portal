import React, { useState } from "react";
import { Text } from "@/components/dfds-ui/typography";
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

export function TabbedPageSection({
  headline,
  headlineChildren,
  tabs,
  tabsContent,
  header,
  footer,
}) {
  const [selectedTab, setSelectedTab] = useState(Object.keys(tabs)[0]);
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

      {/* Tab Navigation */}
      <div className={styles.tabContainer}>
        {Object.keys(tabs).map((index) => (
          <div
            key={index}
            className={`${styles.tab} ${
              selectedTab === index ? styles.activeTab : ""
            }`}
            onClick={() => setSelectedTab(index)}
            style={{ width: `${100 / Object.keys(tabs).length}%` }} // Dynamic width
          >
            {tabs[index]}
          </div>
        ))}
      </div>
      {/* Tab Content */}
      <Card variant="fill" surface="main">
        <CardContent>
          {header}

          {/* Render the content based on the active tab */}
          {Object.keys(tabsContent).map(
            (index) =>
              selectedTab === index && (
                <div key={index}>{tabsContent[index]}</div>
              ),
          )}

          {footer}
        </CardContent>
      </Card>
    </div>
  );
}
