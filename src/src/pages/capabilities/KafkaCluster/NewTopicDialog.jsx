import React, { useEffect, useState, useContext } from "react";
import { Text } from "@/components/ui/Text";
import styles from "./Topics.module.css";
import AppContext from "@/AppContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banner, BannerParagraph } from "@/components/ui/banner";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { TrackedButton } from "@/components/Tracking";

export default function NewTopicDialog({
  capabilityId,
  clusterName,
  inProgress,
  onAddClicked,
  onCloseClicked,
}) {
  const emptyValues = {
    name: "",
    description: "",
    partitions: 3,
    retention: 7,
    availability: "private",
  };

  const [formData, setFormData] = useState(emptyValues);
  const { isAllWithValues, getValidationError } = useContext(AppContext);
  const [descriptionError, setDescriptionError] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    setFormData(emptyValues);
  }, [capabilityId, clusterName]);

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
    let finalValue = newValue;
    if (finalValue !== "forever") {
      finalValue = parseInt(newValue);
    }
    setFormData((prev) => ({ ...prev, ...{ retention: finalValue } }));
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

  const nameContainsUnderscores = formData.name.match(/_/g);

  let nameHintMessage = "";
  if (nameContainsUnderscores) {
    nameHintMessage =
      'It is recommended to use "-" instead of "_" in topic names.';
  }

  useEffect(() => {
    let error = "";
    if (formData.name !== "") {
      error = getValidationError(formData.name, "Please write a name");
    }
    setNameError(error);
  }, [formData.name]);

  useEffect(() => {
    let error = "";
    if (formData.description !== "") {
      error = getValidationError(
        formData.description,
        "Please write a description",
      );
    }
    setDescriptionError(error);
  }, [formData.description]);

  const handleAddClicked = async () => {
    if (onAddClicked) {
      let retention = formData.retention;
      if (!isNaN(retention)) {
        retention = `${retention}d`;
      }

      const validForm = await checkRequiredFields();
      if (validForm) {
        onAddClicked({
          name: fullTopicName,
          description: formData.description,
          partitions: formData.partitions,
          retention: retention,
        });
      }
    }
  };

  const handleCloseClicked = () => {
    if (onCloseClicked) {
      onCloseClicked();
    }
  };

  const checkRequiredFields = async () => {
    const allWithValues = isAllWithValues([
      formData.name,
      formData.description,
    ]);
    if (allWithValues && isNameValid) {
      return true;
    } else {
      setDescriptionError(
        getValidationError(formData.description, "Please write a description"),
      );
      setNameError(getValidationError(formData.name, "Please write a name"));
      return false;
    }
  };

  return (
    <TooltipProvider>
      <Sheet open={true} onOpenChange={(o) => !o && handleCloseClicked()}>
        <SheetContent
          side="right"
          className="w-full sm:w-[30%] overflow-y-auto top-[10%] h-[90%] sm:top-0 sm:h-full"
        >
          <SheetHeader>
            <SheetTitle>Add new topic to {clusterName}...</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Text>
              Topics can be used to communicate that something significant has
              happened within <i>your</i> capability. Thats also one of the
              reasons that the id of your capability (e.g.{" "}
              <span className={styles.capabilityid}>{capabilityId}</span> in
              your case) will be embedded in the topic name.
            </Text>
            <Text>
              Below is the full name of your new topic and a topic build that
              you can use to define the attributes of your topic.
            </Text>

            <div>
              <label className="text-sm font-bold">Full topic name:</label>
              <div className="text-sm">{fullTopicName}</div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="topic-name">Name</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    It is recommended to use "-" (dashes) to separate words in a
                    multi word topic name (e.g. foo-bar instead of foo_bar).
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="topic-name"
                placeholder="Enter name of topic"
                required
                value={formData.name}
                onChange={changeName}
              />
              {nameHintMessage && (
                <p className="text-xs text-[#666666]">{nameHintMessage}</p>
              )}
              {(nameErrorMessage || nameError) && (
                <p className="text-xs text-red-500">
                  {nameErrorMessage || nameError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="topic-description">Description</Label>
              <Input
                id="topic-description"
                placeholder="Enter a description"
                required
                value={formData.description}
                onChange={changeDescription}
              />
              {descriptionError && (
                <p className="text-xs text-red-500">{descriptionError}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="topic-partitions">Partitions</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    A topic is split into multiple partitions for scalability
                    and parallel processing. Each partition is an ordered,
                    immutable sequence of records that is continually appended
                    to.
                  </TooltipContent>
                </Tooltip>
              </div>
              <select
                id="topic-partitions"
                name="partitions"
                className="border rounded px-3 py-2 text-base md:text-sm"
                value={formData.partitions}
                onChange={changePartitions}
              >
                <option value={1}>1</option>
                <option value={3}>3 (default)</option>
                <option value={6}>6</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="topic-retention">Retention</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    The amount of time a topic retains its data before it is
                    discarded or automatically deleted.
                  </TooltipContent>
                </Tooltip>
              </div>
              <select
                id="topic-retention"
                name="retention"
                className="border rounded px-3 py-2 text-base md:text-sm"
                value={formData.retention}
                onChange={changeRetention}
              >
                <option value={7}>7 days</option>
                <option value={31}>31 days</option>
                <option value={365}>365 days</option>
                <option value={"forever"}>Forever</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="topic-availability">Availability</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Private topics are used to facilitate information flow
                    within your capability and no other capabilities has access
                    to those topics. Public topics is one that is intended to be
                    shared with other capabilities which means that all
                    capabilities has read access to public topics - and you will
                    in addition have write access to your own public topics.
                  </TooltipContent>
                </Tooltip>
              </div>
              <select
                id="topic-availability"
                name="availability"
                className="border rounded px-3 py-2 text-base md:text-sm"
                value={formData.availability}
                onChange={changeAvailability}
              >
                <option value={"private"}>Private</option>
                <option value={"public"}>Public</option>
              </select>

              {formData.availability === "public" && (
                <Banner variant="info">
                  <p className="font-bold text-sm mb-1">Please note</p>
                  <BannerParagraph>
                    All public topics will be prefixed with{" "}
                    <span className={styles.capabilityid}>pub.</span> to make it
                    explicit. Have a look at the change to the example above.
                    <br />
                    <br />
                    Public topics comes with a responsibility. All other
                    capabilities has read access to your public topics and can
                    potentially depend on you to not introduce breaking changes
                    to your messages.
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

            <TrackedButton
              trackName="TopicCreate-Confirm"
              size="small"
              type="button"
              submitting={inProgress}
              onClick={handleAddClicked}
            >
              Add
            </TrackedButton>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
