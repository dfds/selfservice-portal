import React, { useContext, useEffect, useState } from "react";
import { Button, ButtonStack, CheckBoxField, Label } from '@dfds-ui/react-components';
import { Radio, RadioGroup } from '@dfds-ui/forms'
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
        isCritical: null,
        containsPII: null
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

    const changeCriticalToTrue = e => {
        const newValue = true;
        setFormData(prev => ({...prev, ...{ isCritical: newValue}}));
    };

    const changeCriticalToFalse = e => {
        const newValue = false;
        setFormData(prev => ({...prev, ...{ isCritical: newValue}}));
    };

    const changePIIToTrue = e => {
        const newValue = true;
        setFormData(prev => ({...prev, ...{ containsPII: newValue}}));
    };

    const changePIIToFalse = e => {
        const newValue = false;
        setFormData(prev => ({...prev, ...{ containsPII: newValue}}));
    };


    const isNameValid = formData.name !== "" &&
        !formData.name.match(/^\s*$/g) &&
        !formData.name.match(/(-|_)$/g) &&
        !formData.name.match(/[^a-zA-Z0-9\-_]/g);

    let nameErrorMessage = "";
    if (formData.name.length > 0 && !isNameValid) {
        nameErrorMessage = 'Allowed characters are a-z, 0-9, "-", "_" and it must not end with "-" or "_".';
    }

    let criticalityErrorMessage = "";
    if (formData.isCritical == null) {
        criticalityErrorMessage = 'Criticallity Required';
    }

    let piiErrorMessage = "";
    if (formData.containsPII == null) {
        piiErrorMessage = 'personal identifiable information (PII) Required';
    }

    const canAdd = formData.name !== "" && formData.description !== "" && formData.isCritical != null && formData.containsPII != null && nameErrorMessage === "";

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


              <RadioGroup visualSize="small" label="Will this capability become a critical system?" column={false} errorMessage={criticalityErrorMessage} required>
                <Radio name="RowRadio2" label="Yes" value={formData.isCritical === true} onChange={changeCriticalToTrue} />
                <Radio name="RowRadio2" label="No" value={formData.isCritical === false} onChange={changeCriticalToFalse} />
               </RadioGroup>   

              <RadioGroup visualSize="small" label="Will this capability contain personal identifiable information (PII) data?" column={false} errorMessage={piiErrorMessage} required>
                <Radio name="RowRadio1" label="Yes" value={formData.containsPII === true} onChange={changePIIToTrue} />
                <Radio name="RowRadio1" label="No" value={formData.containsPII === false} onChange={changePIIToFalse} />
               </RadioGroup>

              <ButtonStack>
                <Button size='small' variation="primary" onClick={handleAddCapabilityClicked} disabled={!canAdd} submitting={inProgress}>Add</Button>
                <Button size='small' variation="outlined" onClick={handleClose}>Cancel</Button>
              </ButtonStack>
          </SideSheetContent>
        </SideSheet>
    </>
}
