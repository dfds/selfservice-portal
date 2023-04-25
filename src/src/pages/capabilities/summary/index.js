import React, { useContext } from "react"
import { Text } from '@dfds-ui/typography';
import { Modal, ModalAction } from '@dfds-ui/modal';
import { Button, ButtonStack } from '@dfds-ui/react-components';
import PageSection from "components/PageSection";
import SelectedCapabilityContext from "SelectedCapabilityContext";

import styles from "./summary.module.css";
import { TextBlock } from "components/Text";
import { useState } from "react";
import { MyMembershipApplication } from "../membershipapplications";

function JoinDialog({ name, isSubmitting, onCloseRequested, onSubmitClicked}) {
  const actions = <>
    <ModalAction actionVariation="primary" submitting={isSubmitting} onClick={onSubmitClicked}>
      Submit
    </ModalAction>
    <ModalAction style={{marginRight: "1rem"}} disabled={isSubmitting} actionVariation="secondary" onClick={onCloseRequested}>
      Cancel
    </ModalAction>
  </>

  return <>
    <Modal heading={`Want to join...?`} isOpen={true} shouldCloseOnOverlayClick={true} shouldCloseOnEsc={true} onRequestClose={onCloseRequested} actions={actions}>
      <Text>
        <strong>Hey</strong>, so you wanna join <TextBlock>{name}</TextBlock>...? Awesome! Apply for a membership by submitting 
        your membership application for approval by existing capability members. When they approve, you become a member.
      </Text>
      <Text styledAs="caption">
        <i>
            <strong>Please note</strong> <br />
            Your membership application will expire after two weeks if it hasn't been approved by existing members.
        </i>
      </Text>
    </Modal>  
  </>
}

export default function Summary() {
    const { name, description, links, submitMembershipApplication } = useContext(SelectedCapabilityContext);
    
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canJoin = (links?.membershipApplications?.allow || []).includes("POST");

    const handleSubmitClicked = async () => {
        setIsSubmitting(true);
        await submitMembershipApplication();
        setIsSubmitting(false);
        setShowJoinDialog(false);
    };

    const handleCloseRequested = () => {
        if (!isSubmitting) {
            setShowJoinDialog(false);
        }
    };

    return <PageSection headline="Summary">
        {showJoinDialog && <JoinDialog 
          name={name} 
          isSubmitting={isSubmitting} 
          onCloseRequested={handleCloseRequested} 
          onSubmitClicked={handleSubmitClicked} 
        />}

        <div className={styles.container}>
            <div className={styles.column}>
                <Text styledAs={'smallHeadline'}>Name</Text> {name}
            </div>
            <div className={styles.column}>
                <Text styledAs={'smallHeadline'}>Description</Text> {description}
            </div>
            <div className={styles.column} style={{paddingTop: "2rem"}}>
                <MyMembershipApplication />
                <ButtonStack align="right">
                    {canJoin && <Button onClick={() => setShowJoinDialog(true)}>Join</Button>}
                    
                    {/* <Button variation="outlined" >Leave</Button> */}
                </ButtonStack>
            </div>
        </div>
        <br />
    </PageSection>
}