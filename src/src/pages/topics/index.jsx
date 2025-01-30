import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  Container,
  Column,
  Card,
  CardMedia,
  CardTitle,
  CardContent,
} from "@dfds-ui/react-components";
import { Text } from "@/components/dfds-ui/typography";
import styles from "./topic.module.css";
import { Spinner } from "@dfds-ui/react-components";
import { H1 } from "@dfds-ui/react-components";
import PageSection from "components/PageSection";
import topicImage from "./topicImage.jpeg";
import { TopicsProvider } from "./TopicsContext";
import AppContext from "../../AppContext";
import { usePublicTopics } from "@/state/remote/queries/kafka";
import { MaterialReactTable } from "material-react-table";
import { Link } from "react-router-dom";
import { RowDetails } from "./rowDetails";
import { Badge } from "@dfds-ui/react-components";
import { ChevronDown, ChevronUp } from "@dfds-ui/icons/system";
import PreAppContext from "@/preAppContext";

function Topics() {
  const { selfServiceApiClient } = useContext(AppContext);
  const { isFetched, data } = usePublicTopics();

  const [filteredData, setfilteredData] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const colors = ["#ED8800", "#4caf50", "#49a2df", "#F1A7AE", "purple"];
  const [clustersMap, setClustersMap] = useState(new Map());
  const updateClustersMap = (k, v) => {
    setClustersMap(new Map(clustersMap.set(k, v)));
  };

  const linkStyle = {
    color: "#1874bc",
    textDecoration: "none",
  };

  const fetchKafkaclusters = async () => {
    const result = await selfServiceApiClient.getKafkaClusters();
    const clustersWithColor = result.map((cluster, index) => {
      const color = colors[index % colors.length];
      updateClustersMap(cluster.id, true);
      return { ...cluster, color };
    });

    return clustersWithColor;
  };

  useEffect(() => {
    if (isFetched) {
      fetchKafkaclusters().then((c) => {
        const finalTopics = data.map((topic) => {
          const copy = { ...topic };
          const color = c.find((cluster) => cluster.id === copy.kafkaClusterId);
          if (color != null) {
            copy.clusterColor = color.color;
          }
          return copy;
        });

        setfilteredData(finalTopics);
        setIsLoadingTopics(false);
      });
    }
  }, [isFetched, data]);

  const columns = useMemo(() => [
    {
      accessorFn: (row) => row.name,
      header: "name",
      id: "name",
      size: "50",
      enableColumnFilterModes: true,
      disableFilters: false,
      enableGlobalFilter: true,
      enableFilterMatchHighlighting: true,

      Cell: ({ cell, renderedCellValue }) => {
        return (
          <div
            onClick={() => cell.row.toggleExpanded()}
            className={styles.pointyCursor}
          >
            <div className={styles.topicheader}>
              <div className={styles.row}>
                <h3 style={{ fontSize: "1.3em", marginRight: "1rem" }}>
                  {renderedCellValue}
                </h3>
                <Badge
                  className={styles.badgecluster}
                  style={{ backgroundColor: cell.row.original.clusterColor }}
                >
                  {cell.row.original.kafkaClusterName}
                </Badge>
              </div>
            </div>
            {!cell.row.getIsExpanded() ? (
              <div className={styles.infocontainer}>
                <p>{cell.row.original.description}</p>
                <div>
                  <div>
                    Capability:{" "}
                    <Link
                      style={linkStyle}
                      to={`/capabilities/${cell.row.original.capabilityId}`}
                    >
                      {cell.row.original.capabilityId}
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "arrow",
      header: "arrow",
      id: "arrow",
      size: "1",
      enableColumnFilterModes: false,
      muiTableBodyCellProps: {
        align: "center",
      },
      Cell: ({ cell }) => {
        return (
          <div
            className={styles.pointyCursor}
            onClick={() => cell.row.toggleExpanded()}
          >
            <div className={styles.chevronBox}>
              {cell.row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
        );
      },
    },
  ]);

  return (
    <>
      <br />
      <br />

      <PageSection headline={`Public Topics`}>
        {isLoadingTopics ? (
          <Spinner instant />
        ) : (
          <>
            <MaterialReactTable
              columns={columns}
              data={filteredData}
              displayColumnDefOptions={{
                "mrt-row-expand": {
                  muiTableHeadCellProps: {
                    sx: {
                      fontWeight: "400",
                      fontSize: "16px",
                      fontFamily: "DFDS",
                      color: "#4d4e4c",
                      padding: "0",
                      width: "1%",
                      align: "centre",
                    },
                  },
                  muiTableBodyCellProps: {
                    sx: {
                      fontWeight: "400",
                      fontSize: "16px",
                      fontFamily: "DFDS",
                      color: "#4d4e4c",
                      padding: "0",
                      width: "1%",
                      align: "centre",
                    },
                  },
                },
              }}
              muiTableHeadCellProps={{
                sx: {
                  fontWeight: "700",
                  fontSize: "16px",
                  fontFamily: "DFDS",
                  color: "#002b45",
                  align: "centre",
                },
              }}
              filterFns={{
                customFilterFn: (row, id, filterValue) => {
                  return true;
                },
              }}
              muiTableBodyCellProps={{
                sx: {
                  fontWeight: "400",
                  fontSize: "16px",
                  fontFamily: "DFDS",
                  color: "#4d4e4c",
                  padding: "0",
                },
              }}
              muiTableDetailPanelProps={{
                sx: {
                  padding: "0",
                },
              }}
              muiTablePaperProps={{
                elevation: 0,
                sx: {
                  borderRadius: "0",
                },
              }}
              enableGlobalFilterModes={true}
              initialState={{
                showGlobalFilter: true,
                columnOrder: ["name", "arrow"],
              }}
              positionGlobalFilter="left"
              muiSearchTextFieldProps={{
                placeholder: `Search`,
                sx: {
                  minWidth: "1120px",
                  fontWeight: "400",
                  fontSize: "16px",
                  padding: "0",
                },
                size: "small",
                variant: "outlined",
              }}
              enableTableHead={false}
              globalFilterFn="contains"
              enableFilterMatchHighlighting={true}
              enableFullScreenToggle={false}
              enableDensityToggle={false}
              enableHiding={false}
              enableFilters={true}
              enableGlobalFilter={true}
              enableTopToolbar={true}
              enableBottomToolbar={true}
              enableColumnActions={false}
              muiTableBodyRowProps={({ row }) => ({
                sx: {
                  padding: 0,
                  margin: 0,
                  minHeight: 0,
                },
              })}
              enablePagination={true}
              renderDetailPanel={({ row }) => (
                <Card
                  sx={{
                    display: "flex",
                    gridTemplateColumns: "1fr 1fr",
                    width: "100%",
                  }}
                >
                  <RowDetails data={row.original}></RowDetails>
                </Card>
              )}
            />
          </>
        )}
      </PageSection>
    </>
  );
}

export default function TopicsPage() {
  const splash = (
    <CardMedia
      aspectRatio="3:2"
      media={<img src={topicImage} alt="" className={styles.cardMediaImage} />}
      className={styles.cardMedia}
    />
  );

  return (
    <>
      <br />
      <br />

      <TopicsProvider>
        <Container>
          <Column m={12} l={12} xl={12} xxl={12}>
            <Text as={H1} styledAs="heroHeadline">
              Public Topics
            </Text>
            <Card
              variant="fill"
              surface="main"
              size="xl"
              reverse={true}
              media={splash}
            >
              <CardTitle largeTitle>Information</CardTitle>
              <CardContent>
                <p>
                  Here, you can find a comprehensive list of Kafka topics that
                  have been made available for development teams to discover and
                  utilize in their projects. Every capability has read access to
                  all public topics.
                </p>
                <p>
                  When producing messages to a public topic, please be aware of
                  sensitive information and treat it responsibly - and as a
                  consumer of messages that might contain sensitive information
                  please also treat the information responsibly.
                </p>
                <p>
                  Browse the list of public Kafka topics and get started on your
                  next project today!
                </p>
              </CardContent>
            </Card>
            <Topics />
          </Column>
        </Container>
      </TopicsProvider>
    </>
  );
}
