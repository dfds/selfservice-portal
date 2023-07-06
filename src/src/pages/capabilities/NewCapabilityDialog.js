import React, { useContext, useEffect, useState } from "react";
import { Button, ButtonStack } from '@dfds-ui/react-components';
import { Text } from '@dfds-ui/typography';
import { SideSheet, SideSheetContent } from '@dfds-ui/react-components'
import { Tooltip, TextField } from '@dfds-ui/react-components'
import { Spinner } from '@dfds-ui/react-components';
import styles from "./capabilities.module.css";
import AppContext from "AppContext";

export default function NewCapabilityDialog({inProgress, onAddCapabilityClicked, onCloseClicked}) {
    const handleClose = () => {
        if (onCloseClicked && !inProgress) {
          onCloseClicked();
        }
    };

    //error banner logic
    //const displayConflictWarning =

    const emptyValues = {
        name: "",
        description: "",
    };

    const [formData, setFormData] = useState(emptyValues);

    const changeName = (e) => {
        e.preventDefault();
        let newName = e?.target?.value || "";
        newName = newName.replace(/\s+/g, "-");

        setFormData(prev => ({...prev, ...{ name: newName.toLowerCase()}}));
    }

    const changeDescription = e => {
        e.preventDefault();
        const newValue = e?.target?.value || emptyValues.description;
        setFormData(prev => ({...prev, ...{ description: newValue}}));
    };

    const isNameValid = formData.name !== "" &&
        !formData.name.match(/^\s*$/g) &&
        !formData.name.match(/(_|-)$/g) &&
        !formData.name.match(/^(_|-)/g) &&
        !formData.name.match(/[-_\.]{2,}/g) &&
        !formData.name.match(/[^a-zA-Z0-9\-_]/g);

    let nameErrorMessage = "";
    if (formData.name.length > 0 && !isNameValid) {
        nameErrorMessage = 'Allowed characters are a-z, 0-9, "-", and "_" and it must not start or end with "_" or "-". Do not use more than one of "-" or "_" in a row.';
    }

    const canAdd = formData.name !== "" && formData.description !== "" && nameErrorMessage === "";

    const handleAddCapabilityClicked = () => {
      if (onAddCapabilityClicked) {
        onAddCapabilityClicked(formData);
      }
    };

    return <>
        <SideSheet header={`Add new Capability`} onRequestClose={handleClose} isOpen={true} width="30%" alignSideSheet="right" variant="elevated" backdrop>
          <SideSheetContent>
              <div className={styles.tooltipsection}>
                  <div className={styles.tooltip}>
                      <Tooltip content='It is recommended to use "-" (dashes) to separate words in a multi word Capability name (e.g. foo-bar instead of foo_bar).'>
                          {/* <Information /> */}
                      </Tooltip>
                  </div>
                  <TextField
                      label="Name"
                      placeholder="Enter name of capability"
                      required
                      value={formData.name}
                      onChange={changeName}
                      errorMessage={nameErrorMessage}
                  />
              </div>

              <TextField
                  label="Description"
                  placeholder="Enter a description"
                  required 
                  value={formData.description}
                  onChange={changeDescription}>
              </TextField>

              <ButtonStack>
                <Button size='small' variation="primary" onClick={handleAddCapabilityClicked} disabled={!canAdd} submitting={inProgress}>Add</Button>
                <Button size='small' variation="outlined" onClick={handleClose}>Cancel</Button>
              </ButtonStack>
          </SideSheetContent>
        </SideSheet>
    </>
}
