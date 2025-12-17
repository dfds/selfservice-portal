import styles from "./MessageContract.module.css";
import Expandable from "../../../components/Expandable";
import Poles from "../../../components/Poles";
import { Text } from "@dfds-ui/typography";
import { SelectField } from "@dfds-ui/react-components";
import React, { useEffect } from "react";
import { Divider } from "@dfds-ui/react-components/divider";
//import SyntaxHighlighter from "react-syntax-highlighter";
//import { vs as syntaxStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ChevronDown, ChevronUp } from "@dfds-ui/icons/system";

function MessageHeader({ schema, isOpen }) {
  return (
    <div
      className={`${styles.header} ${isOpen ? styles.headerselected : null}`}
    >
      <Text styledAs={isOpen ? "bodyInterfaceBold" : "bodyInterface"}>
        {schema.subject} (version {schema.version})
      </Text>
      {!isOpen && <ChevronDown className={styles.chevronSize} />}
      {isOpen && <ChevronUp className={styles.chevronSize} />}
    </div>
  );
}

export default function MessageContracts({
  schema,
  isSelected,
  onHeaderClicked,
}) {
  const headerClickHandler = () => {
    if (onHeaderClicked) {
      onHeaderClicked(schema.id);
    }
  };

  const getHeader = () => (
    <>
      <MessageHeader schema={schema} isOpen={isSelected} />
      <Divider />
    </>
  );

  return (
    <div className={styles.container}>
      <Expandable
        header={getHeader()}
        isOpen={isSelected}
        onHeaderClicked={headerClickHandler}
      >
        <div className={styles.jsoncontainer}>
          <br />
          {schema !== undefined && (
            <div>
              <Text styledAs="label">Schema ({schema.schemaType})</Text>
              <JsonViewer json={schema.schema} />
            </div>
          )}
        </div>
      </Expandable>
    </div>
  );
}
