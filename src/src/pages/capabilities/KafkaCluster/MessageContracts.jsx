import styles from "./MessageContract.module.css";
import Expandable from "../../../components/Expandable";
import { Text } from "@/components/ui/Text";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";

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
      <Separator />
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
              <pre className="mt-2 bg-[#f2f2f2] dark:bg-[#0f172a] border border-[#d9dcde] dark:border-[#334155] rounded-[4px] p-3 font-mono text-[11px] text-[#002b45] dark:text-[#e2e8f0] overflow-auto whitespace-pre-wrap">
                {typeof schema.schema === "string"
                  ? schema.schema
                  : JSON.stringify(schema.schema, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Expandable>
    </div>
  );
}
