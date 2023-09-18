import React, { useEffect, useState, useContext } from "react";
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
