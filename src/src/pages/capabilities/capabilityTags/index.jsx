import React, { useEffect, useContext, useState } from "react";
import PageSection from "components/PageSection";
import { Text } from "@dfds-ui/react-components";
import { TrackedButton, TrackedLink } from "@/components/Tracking";
import { useForm, Controller } from "react-hook-form";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import styles from "./capabilityTags.module.css";
import Select from "react-select";
import PreAppContext from "@/preAppContext";
import { useUpdateCapabilityMetadata } from "@/state/remote/queries/capabilities";
import DropDownUserSelection from "./DropDownUserSelection";
import {
  ENUM_COSTCENTER_OPTIONS,
  ENUM_AVAILABILITY_OPTIONS,
  ENUM_CLASSIFICATION_OPTIONS,
  ENUM_CRITICALITY_OPTIONS
} from "@/constants/tagConstants"

function TagsForm({
    canEditTags,
    onSubmit,
    defaultValues
}) {
    const {
        control,
        setValue,
        clearErrors,
        setError,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onChange",
        defaultValues: defaultValues,
    });

    const [isUserSearchActive, setIsUserSearchActive] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [owner, setOwner] = useState("");
    const { members } = useContext(SelectedCapabilityContext);
  
    const emailValidator = (input) => {
      const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(input);
    };

    const filterMembers = (searchInput) => {
      // filter members based on the search input and presence in owners
      return members.filter((user) =>
        user.name.toLowerCase().includes(searchInput.toLowerCase())
      );
    };
  
    async function handleChange(e) {
      //e.preventDefault();
      const value = e?.target?.value || "";
  
      if (value === "") {
        setIsUserSearchActive(false);
      } else {
        setIsUserSearchActive(true);
      }
      
      if (value) {
        setSuggestions(filterMembers(value));
        if (suggestions.length === 0) {
          setIsUserSearchActive(false);
        }
      }

      setOwner(value);
    }

    const validateData = (data) => {
        // Clear previous errors
        clearErrors();
        
        // Custom validation for text input
        if (!data.ownerInput || data.ownerInput.length == 0) {
            setError("ownerInput", {
                type: "manual",
                message: "Capabilities must have at least one owner",
            });
        }
        
        if (!data.costCenterInput) {
            setError("costCenterInput", {
                type: "manual",
                message: "Cost center is required",
            });
        }

        if (data.sunsetDateInput && new Date(data.sunsetDateInput) < new Date()) {
            setError("sunsetDateInput", {
                type: "manual",
                message: "Sunset date cannot be in the past",
            });
        }
    };

    useEffect(() => {
        if (defaultValues) {
            const data = translateFromTags(defaultValues);
            // Set form values
            Object.entries(data).forEach(([key, value]) => setValue(key, value));

            if (data?.costCenterInput) {
                const selectedOption = ENUM_COSTCENTER_OPTIONS.find(opt => opt.value === data.costCenterInput);
                setValue("costCenterInput", selectedOption || null);
            }
            if (data?.dataClassificationInput) {
                const selectedOption = ENUM_CLASSIFICATION_OPTIONS.find(opt => opt.value === data.dataClassificationInput);
                setValue("dataClassificationInput", selectedOption || null);
            }
            if (data?.serviceCriticalityInput) {
                const selectedOption = ENUM_CRITICALITY_OPTIONS.find(opt => opt.value === data.serviceCriticalityInput);
                setValue("serviceCriticalityInput", selectedOption || null);
            }
            if (data?.serviceAvailabilityInput) {
                const selectedOption = ENUM_AVAILABILITY_OPTIONS.find(opt => opt.value === data.serviceAvailabilityInput);
                setValue("serviceAvailabilityInput", selectedOption || null);
            }
    
            // Validate after setting values
            validateData(data);
        }
      }, [defaultValues, setValue]); // setValue needed?

    const translateToTags = (data) => {
        return {
          "dfds.owner": data.ownerInput,
          "dfds.cost.centre": data.costCenterInput?.value,
          "dfds.planned_sunest": data.sunsetDateInput,
          "dfds.data.classification": data.dataClassificationInput?.value,
          "dfds.service.criticality": data.serviceCriticalityInput?.value,
          "dfds.service.availability": data.serviceAvailabilityInput?.value,
        };
    };

    const translateFromTags = (tags) => {
        const data = {
            ownerInput: tags["dfds.owner"],
            costCenterInput: tags["dfds.cost.centre"],
            sunsetDateInput: tags["dfds.planned_sunset"],
            dataClassificationInput: tags["dfds.data.classification"],
            serviceCriticalityInput: tags["dfds.service.criticality"],
            serviceAvailabilityInput: tags["dfds.service.availability"]
        }
        return data;
    };

    const checkIsMember = (email) => {

      const matches = members.filter((user) =>
        user.email.toLowerCase() === email.toLowerCase()
      );
      return matches.length > 0;
    }

    useEffect(() => {
      setValue("ownerInput", owner);

      clearErrors("ownerInput");
      if (owner.length === 0) {
        setError("ownerInput", {
          type: "manual",
          message: "Capabilities must have an owner",
        });
        return;
      }

      if (!emailValidator(owner)) {
        setError("ownerInput", {
          type: "manual",
          message: "Owner should be a legal email",
        });
        return;
      }

      if (!checkIsMember(owner))  {
        setError("ownerInput", {
          type: "manual",
          message: "Owner should be a member of the capability",
        });
        return;
      }
      
    }, [owner])

    const ownerUpdated = (newOwner) => {
      setIsUserSearchActive(false);
      setOwner(newOwner);
    }

    const submitWrapper = (data) => {
        validateData(data);
    
        if (Object.keys(errors).length > 0) return;
    
        onSubmit(translateToTags(data));
    };
    
    return (
        <>
        { errors != undefined && Object.keys(errors).length > 0 && (
            <Text className={`${styles.error} ${styles.center}`}>
                Some tags are not compliant. Please correct them and resubmit.
            </Text>
        )}
        <form onSubmit={handleSubmit(submitWrapper)}>
        
        {/* Owner */}
        <div>
        <label className={styles.label}>Owner:</label>
                    <span>Each capability must have a single responsible owner.</span>
                    <input
                        type="email"
                        {...register("ownerInput")}
                        placeholder="Search through members"
                        onChange={(e) => handleChange(e)}
                        className={`${styles.input} ${styles.inputBorder}`}
                      />
                
                      {isUserSearchActive ? (
                        <div className={styles.dropDownMenu}>
                          <DropDownUserSelection
                            items={suggestions}
                            addUserFromDropDown={ownerUpdated}
                          />
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>

        <div className={styles.errorContainer}>
          {errors.ownerInput && <span className={styles.error}>{errors.ownerInput.message}</span>}
        </div>
        
        {/* Cost Center */}
        <div>
            <label className={styles.label}>Cost Center:</label>
            <span>Internal analysis and cost aggregation tools such as FinOut requires this to be present.</span>
            <Controller
                name="costCenterInput"
                control={control}
                rules={{ required: "Cost center must be set" }}
                render={({ field }) => <Select {...field} options={ENUM_COSTCENTER_OPTIONS} className={styles.input} />}
                onChange={(selectedOption) => field.onChange(selectedOption.value)}
            />
            <div className={styles.errorContainer}>
                {errors.costCenterInput && <span className={styles.error}>{errors.costCenterInput.message}</span>}
            </div>
        </div>

        {/* Sunset Data */}
        <div>
            <label className={styles.label}>Sunset Date:</label>
            <span>The date when the capability is planned to not be relevant anymore. This is required for requesting Azure Resource Groups.</span>
            <input
                type="date"
                {...register("sunsetDateInput")}
                className={`${styles.input} ${styles.inputBorder}`}
            />
            <div className={styles.errorContainer}>
                {errors.sunsetDateInput && <span className={styles.error}>{errors.sunsetDateInput.message}</span>}
            </div>
        </div>
        
        {/* Data Classification */}
        <div>
            <label className={styles.label}>Data Classification:</label>
            <span>Guidance: <a href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-Data-Confidentiality" target="_blank" rel="noreferrer">Understand Classification</a></span>
            <Controller
                name="dataClassificationInput"
                control={control}
                render={({ field }) => <Select {...field} options={ENUM_CLASSIFICATION_OPTIONS} className={styles.input} />}
                onChange={(selectedOption) => field.onChange(selectedOption.value)}
            />
            <div className={styles.errorContainer}>
                {errors.dataClassificationInput && <span className={styles.error}>{errors.dataClassificationInput.message}</span>}
            </div>
        </div>

        {/* Service Criticality */}
        <div>
            <label className={styles.label}>Service Criticality:</label>
            <span>Guidance: <a href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-System-Criticality" target="_blank" rel="noreferrer">Understand Criticality</a></span>
            <Controller
                name="serviceCriticalityInput"
                control={control}
                render={({ field }) => <Select {...field} options={ENUM_CRITICALITY_OPTIONS} className={styles.input} />}
                onChange={(selectedOption) => field.onChange(selectedOption.value)}
            />
            <div className={styles.errorContainer}>
                {errors.serviceCriticalityInput && <span className={styles.error}>{errors.serviceCriticalityInput.message}</span>}
            </div>
        </div>

        {/* Service Availability */}
        <div>
            <label className={styles.label}>Service Availability:</label>
            <span>Guidance: <a href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-System-Availability" target="_blank" rel="noreferrer">Understand Availability</a></span>
            <Controller
                name="serviceAvailabilityInput"
                control={control}
                render={({ field }) => <Select {...field} options={ENUM_AVAILABILITY_OPTIONS} className={styles.input} />}
                onChange={(selectedOption) => field.onChange(selectedOption.value)}
            />
            <div className={styles.errorContainer}>
                {errors.serviceAvailabilityInput && <span className={styles.error}>{errors.serviceAvailabilityInput.message}</span>}
            </div>
        </div>
        
        {/* Submit Button */}
        <TrackedButton
            trackName="CapabilityTags-Submit"
            size="small"
            variation="outlined"
            disabled={!canEditTags || Object.keys(errors).length > 0}
        >
            Submit
        </TrackedButton>
        </form>
        </>
    )
}

export function CapabilityTagsPageSection() {
    return (
        <PageSection headline="Capability Tags">
        <CapabilityTags />
        </PageSection>
    );
}

export function CapabilityTags() {
    const { metadata, links, details } = useContext(SelectedCapabilityContext);
    const updateCapabilityMetadata = useUpdateCapabilityMetadata();
    const { isCloudEngineerEnabled } = useContext(PreAppContext);

    const [canEditTags, setCanEditTags] = useState(false);


    const [existingTags, setExistingTags] = useState({});
    
    useEffect(() => {
        if (links && (links?.setRequiredMetadata?.allow || []).includes("POST")) {
            setCanEditTags(true);
        }
    }, [links]);

      useEffect(() => {
        if (metadata) {
          setExistingTags(JSON.parse(metadata));
        }
      }, [metadata]);
    

    const handleSubmit = (data) => {
        console.log("submitting", data);
        updateCapabilityMetadata.mutate({
          capabilityDefinition: details,
          payload: {
            jsonMetadata: data,
          },
          isCloudEngineerEnabled: isCloudEngineerEnabled,
        });
    };
    
    return (
        <>
            <TrackedLink
                trackName="TaggingPolicy"
                href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
                target="_blank"
                rel="noreferrer"
            >
                <Text>See Tagging Policy</Text>
            </TrackedLink>
        
            <TagsForm
                defaultValues={existingTags}
                canEditTags={canEditTags}
                onSubmit={(data) => handleSubmit(data)}
            />
        </>
    )
}
