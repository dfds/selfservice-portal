import React, { useContext, useEffect } from "react"
import { Text } from '@dfds-ui/typography';
import { Modal, ModalAction } from '@dfds-ui/modal';
import { Button, ButtonStack } from '@dfds-ui/react-components';
import PageSection from "components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import BasicCapabilityCost from 'components/BasicCapabilityCost';
import { useParams } from 'react-router-dom';

import styles from "./summary.module.css";
import { TextBlock } from "components/Text";
import { useState } from "react";
import { MyMembershipApplication } from "../membershipapplications";
import { ChevronRight } from '@dfds-ui/icons/system';

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

function LeaveDialog({ name, isLeaving, onCloseRequested, onLeaveClicked}) {
  const actions = <>
    <ModalAction actionVariation="primary" submitting={isLeaving} onClick={onLeaveClicked}>
      Leave
    </ModalAction>
    <ModalAction style={{marginRight: "1rem"}} disabled={isLeaving} actionVariation="secondary" onClick={onCloseRequested}>
      Cancel
    </ModalAction>
  </>

  return <>
    <Modal heading={`Are you sure you want to leave ${name}?`} isOpen={true} shouldCloseOnOverlayClick={true} shouldCloseOnEsc={true} onRequestClose={onCloseRequested} actions={actions}>
      <Text>
        <strong>Hey</strong>, so you wanna leave <TextBlock>{name}</TextBlock>...? Are you sure? You will have to reapply for membership to regain access.
      </Text>
    </Modal>
  </>
}

export default function Summary() {
    const { name, description, links, submitMembershipApplication, submitLeaveCapability } = useContext(SelectedCapabilityContext);
    
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const canJoin = (links?.membershipApplications?.allow || []).includes("POST");
    const canLeave = (links?.leaveCapability?.allow || []).includes("POST");

    const handleSubmitClicked = async () => {
        setIsSubmitting(true);
        await submitMembershipApplication();
        setIsSubmitting(false);
        setShowJoinDialog(false);
    };

    const handleLeaveClicked = async () => {
        setIsLeaving(true)
        await submitLeaveCapability();
        setIsLeaving(false)
        setShowLeaveDialog(false);
    };

    const handleCloseRequested = () => {
        if (!isSubmitting) {
            setShowJoinDialog(false);
        }
    };

    const [costDataRaw, setCostDataRaw] = useState([]);
    const [costData, setCostData] = useState(new Map());
    const { id } = useParams();

    const getCostData = () => {
      fetch("http://localhost:8070/api/data/timeseries/capabilitycostdatatotals", {
        headers: {
          "X-Api-Key": "dummykey"
        }
      }).then(data => {
        return data.json();
      }).then(data => {
        setCostDataRaw(data);
      })
    };

    const transformRawCostDataToChartStructure = () => {
      let costDataMap = new Map();

      costDataRaw.forEach(val => {
        if (!costDataMap.has(val.labels[0])) {
          costDataMap.set(val.labels[0], []);
        }

        let chartStructure = {
          name: val.timestamp,
          pv: val.value
        }

        costDataMap.get(val.labels[0]).push(chartStructure)
      })

      costDataMap.forEach((v, k) => {
        costDataMap.set(k, v.reverse());
      })

      setCostData(costDataMap);
    }

    useEffect(() => {
      getCostData();
    }, []);

    useEffect(() => {
      console.log(costData);
    }, [costData]);

    useEffect(() => {
      transformRawCostDataToChartStructure();
    }, [costDataRaw]);

    const getCostDataViaId = (id) => {
      if (costData.has(id)) {
        console.log("costData entry found!");
        return costData.get(id);
      } else {
        return [];
      }
    }

    const testData = getCostDataViaId(id);

    return <PageSection headline="Summary">
        {showJoinDialog && <JoinDialog 
          name={name} 
          isSubmitting={isSubmitting} 
          onCloseRequested={handleCloseRequested} 
          onSubmitClicked={handleSubmitClicked} 
        />}
        {showLeaveDialog && <LeaveDialog
          name={name}
          isLeaving={isLeaving}
          onCloseRequested={() => {
            if (!isLeaving) {
              setShowLeaveDialog(false);
            }
          }}
          onLeaveClicked={handleLeaveClicked}
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
                    
                    {canLeave && <Button variation="outlined" onClick={() => setShowLeaveDialog(true)}>Leave</Button>}
                </ButtonStack>
            </div>
            <div className={styles.column}>
              <Text styledAs={'smallHeadline'}>Cost</Text>
              <BasicCapabilityCost data={getCostDataViaId(id)} capabilityId={id} />
              <a target="_blank" href={`https://app.finout.io/app/total-cost?accountId=e071c3ed-1e3c-46f7-9830-71951712d791&context=%7B%22id%22%3A%2288dc362c-5876-45d9-8c9e-950f1f481e78%22%2C%22metricName%22%3A%22MegaBill%22%2C%22type%22%3A%22cost%22%2C%22name%22%3A%22MegaBill%22%2C%22label%22%3A%22unlabeled%22%2C%22tags%22%3A%7B%7D%2C%22costViewId%22%3A%2232%22%2C%22unitAggregationCount%22%3A1%7D&gbyHiddenLegendIndexes=0_2&filters=%7B%22costCenter%22%3A%22virtualTag%22%2C%22key%22%3A%2252c02d7e-093a-42b7-bf06-eb13050a8687%22%2C%22path%22%3A%22Virtual+Tags%F0%9F%94%A5%2Fcapability%22%2C%22type%22%3A%22virtual_tag%22%2C%22operator%22%3A%22is%22%2C%22value%22%3A%22${id}%22%7D`}><ChevronRight /></a>
            </div>
        </div>
        <br />
    </PageSection>
}

const CostTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className="label">{`${payload[0].payload.name} : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};
