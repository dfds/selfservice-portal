import React, { useEffect, useState, useMemo } from "react";
import { Text } from "@dfds-ui/typography";
import styles from "./Topics.module.css";
import {
  Button,
  Banner,
  BannerHeadline,
  SideSheet,
  SideSheetContent,
  TextField,
  SelectField,
  Tooltip,
  BannerParagraph,
} from "@dfds-ui/react-components";
import { Information } from "@dfds-ui/icons/system";

export default function NewTopicDialog({
  capabilityId,
  clusterName,
  inProgress,
  onAddClicked,
  onCloseClicked,
}) {
  const emptyValues = useMemo(() => {
    return {
      name: "",
      description: "",
      partitions: 3,
      retention: 7,
      availability: "private",
    };
  }, []);

  const [formData, setFormData] = useState(emptyValues);

  useEffect(() => {
    setFormData(emptyValues);
  }, [capabilityId, clusterName, emptyValues]);

  const changeName = (e) => {
    e.preventDefault();
    let newName = e?.target?.value || "";
    newName = newName.replace(/\s+/g, "-");

    setFormData((prev) => ({ ...prev, ...{ name: newName.toLowerCase() } }));
  };

  const changeDescription = (e) => {
    e.preventDefault();
    const newValue = e?.target?.value || emptyValues.description;
    setFormData((prev) => ({ ...prev, ...{ description: newValue } }));
  };

  const changePartitions = (e) => {
    e.preventDefault();
    const newValue = e?.target?.value || emptyValues.partitions;
    setFormData((prev) => ({ ...prev, ...{ partitions: parseInt(newValue) } }));
  };

  const changeRetention = (e) => {
    e.preventDefault();
    const newValue = e?.target?.value || emptyValues.retention;
    setFormData((prev) => ({ ...prev, ...{ retention: parseInt(newValue) } }));
  };

  const changeAvailability = (e) => {
    e.preventDefault();
    const newValue = e?.target?.value || emptyValues.availability;
    setFormData((prev) => ({ ...prev, ...{ availability: newValue } }));
  };

  const publicPrefix = formData.availability === "public" ? "pub." : "";

  const topicName = formData.name === "" ? "<name>" : formData.name;

  const fullTopicName = `${publicPrefix}${capabilityId}.${topicName}`;

  const isNameValid =
    formData.name !== "" &&
    !formData.name.match(/^\s*$/g) &&
    !formData.name.match(/(-|_)$/g) &&
    !formData.name.match(/^(-|_)/g) &&
    !formData.name.match(/[^a-zA-Z0-9\-_]/g) &&
    !formData.name.match(/[-_]{2,}/g);

  let nameErrorMessage = "";
  if (formData.name.length > 0 && !isNameValid) {
    nameErrorMessage =
      'Allowed characters are a-z, 0-9, "-", "_" and it must not start or end with "-" or "_". Do not use more than one of "-" and "_" in a row.';
  }

  const canAdd =
    formData.name !== "" &&
    formData.description !== "" &&
    !inProgress &&
    nameErrorMessage === "";

  const nameContainsUnderscores = formData.name.match(/_/g);

  let nameHintMessage = "";
  if (nameContainsUnderscores) {
    nameHintMessage =
      'It is recommended to use "-" instead of "_" in topic names.';
  }

  const handleAddClicked = () => {
    if (onAddClicked) {
      onAddClicked({
        name: fullTopicName,
        description: formData.description,
        partitions: formData.partitions,
        retention: formData.retention,
      });
    }
  };

  const handleCloseClicked = () => {
    if (onCloseClicked) {
      onCloseClicked();
    }
  };

  return (
    <SideSheet
      header={`Add new topic to ${clusterName}...`}
      onRequestClose={handleCloseClicked}
      isOpen={true}
      width="30%"
      alignSideSheet="right"
      variant="elevated"
      backdrop
    >
      <SideSheetContent>
        <Text>
          Topics can be used to communicate that something significant has
          happened within <i>your</i> capability. Thats also one of the reasons
          that the id of your capability (e.g.{" "}
          <span className={styles.capabilityid}>{capabilityId}</span> in your
          case) will be embedded in the topic name.
        </Text>
        <Text>
          Below is the full name of your new topic and a topic build that you
          can use to define the attributes of your topic.
        </Text>

        <br />

        <Text as={"label"} styledAs="labelBold">
          Full topic name:
        </Text>
        <Text as={"div"} styledAs="bodyInterface">
          {fullTopicName}
        </Text>

        <br />
        <br />

        <div className={styles.tooltipsection}>
          <div className={styles.tooltip}>
            <Tooltip content='It is recommended to use "-" (dashes) to separate words in a multi word topic name (e.g. foo-bar instead of foo_bar).'>
              <Information />
            </Tooltip>
          </div>
          <TextField
            label="Name"
            placeholder="Enter name of topic"
            required
            value={formData.name}
            onChange={changeName}
            errorMessage={nameErrorMessage}
            assistiveText={nameHintMessage}
          />
        </div>

        <TextField
          label="Description"
          placeholder="Enter a description"
          required
          value={formData.description}
          onChange={changeDescription}
        ></TextField>

        <div className={styles.tooltipsection}>
          <div className={styles.tooltip}>
            <Tooltip content="A topic is split into multiple partitions for scalability and parallel processing. Each partition is an ordered, immutable sequence of records that is continually appended to.">
              <Information />
            </Tooltip>
          </div>
          <SelectField
            name="partitions"
            label="Partitions"
            value={formData.partitions}
            required
            onChange={changePartitions}
          >
            <option value={1}>1</option>
            <option value={3}>3 (default)</option>
            <option value={6}>6</option>
          </SelectField>
        </div>

        <div className={styles.tooltipsection}>
          <div className={styles.tooltip}>
            <Tooltip content="The amount of time a topic retains its data before it is discarded or automatically deleted.">
              <Information />
            </Tooltip>
          </div>
          <SelectField
            name="retention"
            label="Retention"
            value={formData.retention}
            required
            onChange={changeRetention}
          >
            <option value={7}>7 days</option>
            <option value={31}>31 days</option>
            <option value={365}>365 days</option>
            <option value={-1}>Forever</option>
          </SelectField>
        </div>

        <div className={styles.tooltipsection}>
          <div className={styles.tooltip}>
            <Tooltip content="Private topics are used to facilitate information flow within your capability and no other capabilities has access to those topics. Public topics is one that is intended to be shared with other capabilities which means that all capabilities has read access to public topics - and you will in addition have write access to your own public topics.">
              <Information />
            </Tooltip>
          </div>
          <SelectField
            name="availability"
            label="Availability"
            value={formData.availability}
            required
            onChange={changeAvailability}
          >
            <option value={"private"}>Private</option>
            <option value={"public"}>Public</option>
          </SelectField>

          {formData.availability === "public" && (
            <Banner variant="lowEmphasis">
              <BannerHeadline>Please note</BannerHeadline>
              <BannerParagraph>
                All public topics will be prefixed with{" "}
                <span className={styles.capabilityid}>pub.</span> to make it
                explicit. Have a look at the change to the example above.
                <br />
                <br />
                Public topics comes with a responsibility. All other
                capabilities has read access to your public topics and can
                potentially depend on you to not introduce breaking changes to
                your messages.
                <br />
                <br />
                You also have a responsibility to communicate about any new
                messages that you want to introduce to the topic as it can
                potentially have consequences for consumers.
                <br />
                <br />
                But remember, <i>sharing is caring.</i>
              </BannerParagraph>
            </Banner>
          )}
        </div>

        <br />
        <Button
          size="small"
          type="button"
          disabled={!canAdd}
          submitting={inProgress}
          onClick={handleAddClicked}
        >
          Add
        </Button>
      </SideSheetContent>
    </SideSheet>
  );
}
