import React, {useContext} from "react";
import AppContext from "../../../AppContext";
import {useParams} from "react-router-dom";
import PageSection from "../../../components/PageSection";
import styles from "../summary/summary.module.css";
import {Text} from "@dfds-ui/typography";
import {LargeCapabilityCostSummary} from "../../../components/BasicCapabilityCost";
import {Spinner} from "@dfds-ui/react-components";

export default function Costs() {
    const {appStatus, capabilityCosts} = useContext(AppContext)

    const {id} = useParams();
    const isLoading = !appStatus.hasLoadedCosts;
    const dayWindows = [7, 14, 30];


    return <PageSection headline="Costs">
        <div className={styles.container}>

            {dayWindows.map((days, index) => {
                    const dataValue = capabilityCosts.getCostsForCapability("Total", days);

                    return (
                        <div key={index} className={styles.column} align="center">

                            <Text styledAs={'smallHeadline'}>{days} Days</Text>

                            {isLoading ? <Spinner instant/> : <>
                                <LargeCapabilityCostSummary key={index}
                                                            data={dataValue}
                                                            capabilityId={id}/>
                                <a target="_blank"
                                   href={`https://app.finout.io/app/total-cost?accountId=e071c3ed-1e3c-46f7-9830-71951712d791&context=%7B%22id%22%3A%2288dc362c-5876-45d9-8c9e-950f1f481e78%22%2C%22metricName%22%3A%22MegaBill%22%2C%22type%22%3A%22cost%22%2C%22name%22%3A%22MegaBill%22%2C%22label%22%3A%22unlabeled%22%2C%22tags%22%3A%7B%7D%2C%22costViewId%22%3A%2232%22%2C%22unitAggregationCount%22%3A1%7D&gbyHiddenLegendIndexes=0_2&filters=%7B%22costCenter%22%3A%22virtualTag%22%2C%22key%22%3A%2252c02d7e-093a-42b7-bf06-eb13050a8687%22%2C%22path%22%3A%22Virtual+Tags%F0%9F%94%A5%2Fcapability%22%2C%22type%22%3A%22virtual_tag%22%2C%22operator%22%3A%22is%22%2C%22value%22%3A%22${id}%22%${days}D`}>Finout
                                    link</a>
                            </>}
                        </div>
                    )
                }
            )}

        </div>
        <br/>
    </PageSection>
}