import React, { useContext } from "react";
import { Text } from '@dfds-ui/typography';
import { useNavigate } from "react-router-dom";
import { ChevronRight, StatusAlert } from '@dfds-ui/icons/system';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { Spinner } from '@dfds-ui/react-components';
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import styles from "./myCapabilities.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts';
import BasicCapabilityCost from 'components/BasicCapabilityCost';

export default function MyCapabilities() {
    const { myCapabilities, appStatus } = useContext(AppContext);

    const items = myCapabilities || [];
    const isLoading = !appStatus.hasLoadedMyCapabilities;

    const navigate = useNavigate();
    const clickHandler = (id) => navigate(`/capabilities/${id}`);

    const [costDataRaw, setCostDataRaw] = useState([]);
    const [costData, setCostData] = useState(new Map());

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

    return <>
        <PageSection headline={`My Capabilities ${isLoading ? "" : `(${items.length})`}`}>
            { isLoading &&
                <Spinner />
            }

            { !isLoading && items.length === 0 &&
                <Text>Oh no! You have not joined a capability...yet! Knock yourself out with the ones below...</Text>
            }

            { !isLoading && items.length > 0 &&
                <>
                    <Table isInteractive width={"100%"}>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell align="right"></TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map(x => <TableRow key={x.id} onClick={() => clickHandler(x.id)}>
                                <TableDataCell>
                                    <Text className="warningIcon" hidden={x.status == "Active"}><StatusAlert /></Text>
                                    <Text styledAs="action" as={"div"}>{x.name}</Text>
                                    <Text styledAs="caption" as={"div"}>{x.description}</Text>
                                </TableDataCell>
                                <TableDataCell align="right">
                                    <BasicCapabilityCost data={getCostDataViaId(x.id)} capabilityId={x.id}/>
                                    <ChevronRight />
                                </TableDataCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </>
            }
        </PageSection>
    </>
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
