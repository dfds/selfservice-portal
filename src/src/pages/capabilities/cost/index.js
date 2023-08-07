import React, { useContext, useEffect, useState } from "react";
import { Text } from "@dfds-ui/typography";
import { Card, CardContent } from "@dfds-ui/react-components";
import BasicCapabilityCost from 'components/BasicCapabilityCost';
import { useParams } from 'react-router-dom';
import { ChevronRight } from '@dfds-ui/icons/system';
import styles from "../capabilities.module.css";


export default function Cost() {

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


    return (
        <>
            <Text styledAs="sectionHeadline">Cost</Text>
            <Card variant="fill" surface="main">
                <CardContent>
                    <BasicCapabilityCost data={getCostDataViaId(id)} capabilityId={id} />
                    <ChevronRight />
                </CardContent>
            </Card>
        </>
    );
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