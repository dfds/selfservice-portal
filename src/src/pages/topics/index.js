import React, { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Column,
  Card,
  CardMedia,
  CardTitle,
  CardContent,
} from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import { TextField } from "@dfds-ui/react-components";
import { Search } from "@dfds-ui/icons/system";
import { SearchView } from "./SearchView";
import { Checkbox } from "@dfds-ui/forms/checkbox";
import styles from "./topic.module.css";
import { Spinner } from "@dfds-ui/react-components";
import { H1 } from "@dfds-ui/react-components";
import PageSection from "components/PageSection";
import TopicsContext from "pages/topics/TopicsContext";
import topicImage from "./topicImage.jpeg";
import { TopicsProvider } from "./TopicsContext";
import AppContext from "../../AppContext";
import { useTopics } from "hooks/Topics";
import { MaterialReactTable } from 'material-react-table';

function Topics() {
  const { selectedKafkaTopic, toggleSelectedKafkaTopic } =
    useContext(TopicsContext);
  const { selfServiceApiClient } = useContext(AppContext);
  const { topicsList, isLoaded } = useTopics();

  const [topics, setTopics] = useState([]);
  const [filteredData, setfilteredData] = useState([]);
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [clusters, setClusters] = useState([]);
  const colors = ["#ED8800", "#4caf50", "#49a2df", "#F1A7AE", "purple"];
  const [clustersMap, setClustersMap] = useState(new Map());
  const updateClustersMap = (k, v) => {
    setClustersMap(new Map(clustersMap.set(k, v)));
  };

  const handleTopicClicked = (topicId) => {
    toggleSelectedKafkaTopic(topicId);
  };

  const fetchKafkaclusters = async () => {
    const result = await selfServiceApiClient.getKafkaClusters();
    const clustersWithColor = result.map((cluster, index) => {
      const color = colors[index % colors.length];
      updateClustersMap(cluster.id, true);
      return { ...cluster, color };
    });

    setClusters(clustersWithColor);
    return clustersWithColor;
  };

  let inputHandler = (e) => {
    var lowerCase = e.target.value.toLowerCase();
    setInputText(lowerCase);
  };

  let filter = (e) => {
    var lowerCase = e.target.value.toLowerCase();
    const highlightedData = topics.map((topic) => {
      const copy = { ...topic };
      const nameAndDescription = `${copy.name || ""} ${copy.description}`;
      const index = nameAndDescription.toLocaleLowerCase().indexOf(lowerCase);
      if (index > -1) {
        copy.highlight = lowerCase;
      }

      return copy;
    });

    let finalResult = highlightedData.filter((el) => el.highlight != null);

    let filteredResult = [];

    [...clustersMap.keys()].forEach((k) => {
      let clusterState = clustersMap.get(k);
      if (clusterState) {
        filteredResult = filteredResult.concat(
          finalResult.filter((el) => el.kafkaClusterId === k),
        );
      }

      filteredResult.sort((a, b) => a.name.localeCompare(b.name));
    });

    setfilteredData(filteredResult);
  };

  const clickHandler = (id) => navigate(`/capabilities/${id}`);

  useEffect(() => {
    if (isLoaded) {
      fetchKafkaclusters().then((c) => {
        const finalTopics = topicsList.map((topic) => {
          const copy = { ...topic };
          const color = c.find((cluster) => cluster.id === copy.kafkaClusterId);
          if (color != null) {
            copy.clusterColor = color.color;
          }
          return copy;
        });

        setTopics(finalTopics);
        setfilteredData(finalTopics);
        setIsLoadingTopics(false);
      });
    }
  }, [isLoaded, topicsList]);

  useEffect(() => {
    filter({
      target: {
        value: inputText,
      },
    });
  }, [clustersMap, inputText]);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.name,
        header: 'name',
        size: 350,
        enableColumnFilterModes: true,
        disableFilters: false,
        enableGlobalFilter: true,
        enableFilterMatchHighlighting: true,


        // Cell: ({ cell, renderedCellValue }) => {
        //   return <div>{id}
        //   </div>
        // }

      }
    ],
    [],
  )

  return (
    <>
      <br />
      <br />

      <PageSection headline={`Public Topics`}>
        <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
          <TextField
            name="basic"
            onChange={inputHandler}
            prefix="Test"
            placeholder="Search"
            icon={<Search />}
            help="I need some more help"
            style={{ marginBottom: "0" }}
          />

          <div className={styles.container_checkboxes}>
            <Text as={"span"} style={{ color: "#4d4e4cb3" }}>
              <i>{filteredData.length} Results</i>
            </Text>
            <div className={styles.checkboxes}>
              {clusters.map((cluster) => (
                <Checkbox
                  key={cluster.id}
                  checked={clustersMap.get(cluster.id)}
                  onChange={() => {
                    updateClustersMap(cluster.id, !clustersMap.get(cluster.id));
                    inputHandler({
                      target: {
                        value: inputText,
                      },
                    });
                  }}
                >
                  {cluster.name} ({cluster.id})
                </Checkbox>
              ))}
            </div>
          </div>
        </div>

        {isLoadingTopics ? (
          <Spinner instant />
        ) : (
          <>
            {filteredData.map((x) => (
              <div key={x.id} style={{ marginBottom: "15px" }}>
                <SearchView data={x} onTopicClicked={handleTopicClicked} />
              </div>
            ))}

            <MaterialReactTable columns={columns} data={filteredData}
              muiTableHeadCellProps={{
                sx: {
                  fontWeight: '700',
                  fontSize: '16px',
                  fontFamily: 'DFDS',
                  color: '#002b45',
                },
              }}
              filterFns={{
                customFilterFn: (row, id, filterValue) => {
                  console.log(row.getValue(id));
                  console.log(row);
                  return true;

                },
              }}
              muiTableBodyCellProps={{
                sx: {
                  fontWeight: '400',
                  fontSize: '16px',
                  fontFamily: 'DFDS',
                  color: '#4d4e4c',
                  padding: '5px',
                },
              }}
              muiTablePaperProps={{
                elevation: 0, //change the mui box shadow
                //customize paper styles
                sx: {
                  borderRadius: '0',
                }
              }
              }
              enableGlobalFilterModes={true}
              initialState={{
                showGlobalFilter: true,
              }}
              positionGlobalFilter="left"
              muiSearchTextFieldProps={{
                placeholder: `Find a capability...`,
                sx: {
                  minWidth: '1120px',
                  fontWeight: '400',
                  fontSize: '16px',
                  padding: '5px',
                },
                size: 'small',
                variant: 'outlined',
              }}
              globalFilterFn="contains"
              enableFilterMatchHighlighting={true}
              enableFullScreenToggle={false}
              enableDensityToggle={false}
              enableHiding={false}
              enableFilters={true}
              enableGlobalFilter={true}
              enableTopToolbar={true}
              enableBottomToolbar={false}
              enableColumnActions={false}
              muiTableBodyRowProps2={({ row }) => ({
                onClick: () => {
                  clickHandler(row.original.id)
                },
                sx: {
                  cursor: 'pointer',
                  background: row.original.status === 'Delete' ? '#d88' : '',
                  padding: 0,
                  margin: 0,
                  minHeight: 0,
                }
              })}

              renderDetailPanel={({ row }) => (
                <Card
                  sx={{
                    display: 'grid',
                    margin: 'auto',
                    gridTemplateColumns: '1fr 1fr',
                    width: '100%',
                  }}
                >
                  {/* <>
                    {(contracts || []).length === 0 && (
                      <div>No message contracts defined...yet!</div>
                    )}

                    {(contracts || []).length !== 0 && (
                      <Text styledAs="actionBold">
                        Message Contracts ({(contracts || []).length})
                      </Text>
                    )}

                    {(contracts || []).map((messageContract) => (
                      <Message
                        key={messageContract.id}
                        {...messageContract}
                        isSelected={
                          messageContract.id === selectedMessageContractId
                        }
                        onHeaderClicked={(id) => handleMessageHeaderClicked(id)}
                      />
                    ))}
                  </> */}
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
    <CardMedia aspectRatio="3:2" media={<img src={topicImage} alt="" className={styles.cardMediaImage} />} className={styles.cardMedia} />
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
