import React, { useContext, useEffect, useState } from "react";
import { Button } from '@dfds-ui/react-components';
import { Card, CardTitle, CardContent, CardMedia, CardActions } from '@dfds-ui/react-components';
import styles from "./capabilities.module.css";
import AppContext from "AppContext";
import NewCapabilityDialog from "./NewCapabilityDialog";
import MyCapabilities from "./MyCapabilities";
import OtherCapabilities from "./OtherCapabilities";
import Page from "components/Page";
import SpashImage from "./splash.jpg";
import { SelectedCapabilityProvider } from "../../SelectedCapabilityContext";

export default function CapabilitiesPage() {
    const { user, reloadOtherCapabilities, addNewCapability } = useContext(AppContext);
    const [showNewCapabilityDialog, setShowNewCapabilityDialog] = useState(false);
    const [isCreatingNewCapability, setIsCreatingNewCapability] = useState(false);

    useEffect(() => {
        if (user && user.isAuthenticated) {
            reloadOtherCapabilities();
        }
    }, []);

    const handleAddCapability = async (formData) => {
      setIsCreatingNewCapability(true);
      await addNewCapability(formData.name, formData.description);
      setShowNewCapabilityDialog(false);
      setIsCreatingNewCapability(false);
    };

    const splash = <CardMedia aspectRatio='3:2' media={
        <img src={SpashImage} alt="" />
    } />

    return <>
    
    <Page title={"Capabilities"}>
      {showNewCapabilityDialog && 
        <NewCapabilityDialog 
          inProgress={isCreatingNewCapability}
          onAddCapabilityClicked={handleAddCapability}
          onCloseClicked={() => setShowNewCapabilityDialog(false)}
        />
      }

      <Card variant="fill" surface="main" size='xl' reverse={true} media={splash}>
          <CardTitle largeTitle>Information</CardTitle>
          <CardContent>
              <p>
                  Capabilities should be named uniquely after their (business) capability.
                  Avoid using team or project names. For more information <a href='https://wiki.dfds.cloud/playbooks'>head on over to the Playbooks.</a>
              </p>
              <p>
                  <strong>Please note:</strong> Capability security is our collective responsibility. <a href="https://wiki.dfds.cloud/en/documentation/security/security-knowledge-base-documents">Please visit our security documentation.</a>
              </p>
              <p>
                  You can add a new capability by clicking the button below:
              </p>
          </CardContent>
          <CardActions>
              <Button size='small' onClick={() => setShowNewCapabilityDialog(true)}>Add</Button>
          </CardActions>
      </Card>

      <br/>

      <MyCapabilities />

      <br/>

      <OtherCapabilities />
    </Page>

    </> 
}
