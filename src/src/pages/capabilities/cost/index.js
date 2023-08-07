import React, {useContext, useEffect, useState} from "react";
import {Text} from "@dfds-ui/typography";
import {Card, CardContent} from "@dfds-ui/react-components";
import CapabilityCostSummary from 'components/BasicCapabilityCost';
import {useParams} from 'react-router-dom';
import {ChevronRight} from '@dfds-ui/icons/system';
import styles from "../capabilities.module.css";
import AppContext from "../../../AppContext";


export default function Cost() {
    const {id} = useParams();
    const {capabilityCosts} = useContext(AppContext);

    const [costData, setCostData] = useState([]);

    useEffect(() => {
        setCostData(capabilityCosts.getCostsForCapability("board-customers-meroa", 7));
    }, [id]);

    return (
        <>
            <Text styledAs="sectionHeadline">Cost</Text>
            <Card variant="fill" surface="main">
                <CardContent>
                    <CapabilityCostSummary data={costData} capabilityId={id}/>
                    <ChevronRight/>
                </CardContent>
            </Card>
        </>
    );
}

const CostTooltip = ({active, payload, label}) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.customTooltip}>
                <p className="label">{`${payload[0].payload.name} : ${payload[0].value}`}</p>
            </div>
        );
    }

    return null;
};
