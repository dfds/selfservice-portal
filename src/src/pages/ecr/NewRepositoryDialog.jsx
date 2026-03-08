import React, { useState, useContext, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppContext from "AppContext";
import { TrackedButton } from "@/components/Tracking";

export default function NewRepositoryDialog({ onClose }) {
  const [isCreatingNewRepository, setIsCreatingNewRepository] = useState(false);
  const { addNewRepository, isAllWithValues, getValidationError } =
    useContext(AppContext);
  const [descriptionError, setDescriptionError] = useState("");
  const [nameError, setNameError] = useState("");

  const handleClose = () => {
    if (!isCreatingNewRepository) {
      onClose();
    }
  };

  const emptyValues = {
    name: "",
    description: "",
  };

  const [formData, setFormData] = useState(emptyValues);

  const changeName = (e) => {
    e.preventDefault();
    let newName = e?.target?.value || emptyValues.name;
    newName = newName.replace(/\s+/g, "/");

    setFormData((prev) => ({
      ...prev,
      ...{ name: newName.toLowerCase() },
    }));
  };

  const changeDescription = (e) => {
    e.preventDefault();
    const newValue = e?.target?.value || emptyValues.description;
    setFormData((prev) => ({ ...prev, ...{ description: newValue } }));
  };

  const isNameValid =
    formData.name !== "" &&
    !formData.name.match(/^\s*$/g) &&
    !formData.name.match(/(_|-|\/|\.)$/g) &&
    !formData.name.match(/^(_|-|\/|\.)/g) &&
    !formData.name.match(/[-_/.\s]{2,}/g) &&
    !formData.name.match(/[^a-zA-Z0-9/\-_. ]/g);

  let nameErrorMessage = "";
  if (formData.name.length > 0 && !isNameValid) {
    nameErrorMessage =
      'Allowed characters are a-z, 0-9, ".", "-", "_", and "/". Repositories must not start or end with ".", "_", "-", or "/". Do not use more than one of ".", "-", "_", or "/" in a row.';
  }

  if (formData.name.length > 150) {
    nameErrorMessage = "Please consider a shorter name.";
  }

  const handleAddRepositoryClicked = async () => {
    setIsCreatingNewRepository(true);
    const validForm = await checkRequiredFields();
    if (validForm) {
      await addNewRepository(formData);
      onClose();
    }

    setIsCreatingNewRepository(false);
  };

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
    <>
      <Sheet open={true} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Add new Repository</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="repo-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="repo-name"
                placeholder="Enter name of repository"
                required
                value={formData.name}
                onChange={changeName}
                maxLength={255}
              />
              {(nameErrorMessage || nameError) && (
                <p className="text-xs text-red-500">
                  {nameErrorMessage || nameError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="repo-description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Input
                id="repo-description"
                placeholder="Enter a description"
                required
                value={formData.description}
                onChange={changeDescription}
              />
              {descriptionError && (
                <p className="text-xs text-red-500">{descriptionError}</p>
              )}
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <TrackedButton
                trackName="ECRRepositoryCreate-Confirm"
                size="sm"
                variant="default"
                onClick={handleAddRepositoryClicked}
                disabled={isCreatingNewRepository}
              >
                Add
              </TrackedButton>
              <TrackedButton
                trackName="ECRRepositoryCreate-Cancel"
                size="sm"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </TrackedButton>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
