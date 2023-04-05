import React, { useContext } from "react"
import { Text } from '@dfds-ui/typography';
import { Modal, ModalAction } from '@dfds-ui/modal';
import { Button, ButtonStack } from '@dfds-ui/react-components';
import PageSection from "components/PageSection";
import AppContext from "app-context";

import styles from "./summary.module.css";
import { TextBlock } from "components/Text";
import { useState } from "react";
import { useEffect } from "react";

export default function Summary() {
    const { selectedCapability } = useContext(AppContext);
    
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canJoin = (selectedCapability?.details?._links?.membershipApplications?.allow || []).includes("POST");

    const handleSubmitClicked = async () => {
        setIsSubmitting(true);
        await selectedCapability.submitMembershipApplication();
        setIsSubmitting(false);
        setShowJoinDialog(false);
    };

    const handleCloseRequested = () => {
        if (!isSubmitting) {
            setShowJoinDialog(false);
        }
    };

    return <PageSection headline="Summary">

        <Modal heading={`Want to join...?`} isOpen={showJoinDialog} shouldCloseOnOverlayClick={true} shouldCloseOnEsc={true} onRequestClose={handleCloseRequested} actions={<>
              <ModalAction actionVariation="primary" submitting={isSubmitting} onClick={handleSubmitClicked}>
                Submit
              </ModalAction>
              <ModalAction style={{marginRight: "1rem"}} disabled={isSubmitting} actionVariation="secondary" onClick={handleCloseRequested}>
                Cancel
              </ModalAction>
            </>}>
          
          <Text>
            <strong>Hey</strong>, so you wanna join <TextBlock>{selectedCapability.details.name}</TextBlock>...? Awesome! Apply for a membership by submitting 
            your membership application for approval by existing capability members. When they approve, you become a member.
          </Text>
          <Text styledAs="caption">
            <i>
                <strong>Please note</strong> <br />
                Your membership application will expire after two weeks if it hasn't been approved by existing members.
            </i>
          </Text>
        </Modal>

        <div className={styles.container}>
            <div className={styles.column}>
                <Text styledAs={'smallHeadline'}>Name</Text> {selectedCapability?.details?.name}
            </div>
            <div className={styles.column}>
                <Text styledAs={'smallHeadline'}>Description</Text> {selectedCapability?.details?.description}
            </div>
            <div className={styles.column} style={{paddingTop: "2rem"}}>
                <ButtonStack align="right">
                    {canJoin && <Button onClick={() => setShowJoinDialog(true)}>Join</Button>}
                    
                    {/* <Button variation="outlined" >Leave</Button> */}
                </ButtonStack>
            </div>
        </div>
        <br />
    </PageSection>
}