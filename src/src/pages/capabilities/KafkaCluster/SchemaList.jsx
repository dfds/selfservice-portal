import React from "react";
import { Text } from "@dfds-ui/typography";
import { Divider } from "@dfds-ui/react-components/divider";

export default function SchemaList({
  name,
  schemas,
  clusterId,
  selectedSchema,
  onSchemaClicked,
}) {
  console.log("SchemaList");
  let sorted = [...schemas];

  const handleSchemaClicked = (schemaId) => {
    if (onSchemaClicked) {
      onSchemaClicked(clusterId, schemaId);
    }
  };

  return (
    <>
      <Text styledAs="action">{name}</Text>
      <Divider />
      {sorted.length === 0 && (
        <div
          style={{ paddingLeft: "1rem", fontStyle: "italic", color: "#ccc" }}
        >
          No {name.toLocaleLowerCase()} schemas...yet!
        </div>
      )}

      {sorted.map((schema) => (
        <Text>{schema.subject}</Text>
      ))}
    </>
  );
}
