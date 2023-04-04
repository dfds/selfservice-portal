import { getAllTopics, getKafkaClusters } from "./../../SelfServiceApiClient";
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { Container, Column, Card, CardMedia, CardTitle, CardContent, CardActions, CardPriceTag } from '@dfds-ui/react-components'
import { Text } from '@dfds-ui/typography';
import { TextField } from '@dfds-ui/react-components';
import { Search } from '@dfds-ui/icons/system';
import {SearchView} from './SearchView';
import { Checkbox } from '@dfds-ui/forms/checkbox';
import styles from "./topic.module.css";
import { Spinner } from '@dfds-ui/react-components';
import { H1 } from '@dfds-ui/react-components';
import PageSection from "components/PageSection";




function Topics() {

    const [topics, setTopics] = useState([]);
    const [filteredData, setfilteredData] = useState([]);
    const navigate = useNavigate();
    const [inputText, setInputText] = useState(""); 
    const [isLoadingTopics, setIsLoadingTopics] = useState(true);
    const [clusters, setClusters] = useState([]);
    const colors = ['#ED8800', '#4caf50', 'blue', 'yellow', 'purple'];
    const [clustersMap, setClustersMap] = useState(new Map());
    const updateClustersMap = (k,v) => {
        setClustersMap(new Map(clustersMap.set(k,v)));
    }


    const fetchKafkaclusters = async () => {
        const result = await getKafkaClusters();
        const clustersWithColor = result.map((cluster, index) => {
            const color = colors[index % colors.length];
            updateClustersMap(cluster.id, false);
            return {...cluster, color};
        })

        setClusters(clustersWithColor);

        return clustersWithColor;
    }

    let inputHandler = (e) => {
        var lowerCase = e.target.value.toLowerCase();
        setInputText(lowerCase);
    };

    let filter = (e) => {
        var lowerCase = e.target.value.toLowerCase();
        const highlightedData = topics.map((topic) =>  {
            const copy = {...topic};
            const nameAndDescription = `${copy.name || ""} ${copy.description}`;
            const index = nameAndDescription
            .toLocaleLowerCase().indexOf(lowerCase);
            if (index > -1) {
                copy.highlight =  lowerCase                
            }

            return copy

        });

        let finalResult = highlightedData.filter((el) => el.highlight != null );

        [...clustersMap.keys()].forEach(k => {
            let clusterState = clustersMap.get(k);
            if (clusterState){
                finalResult = finalResult.filter((el) => el.kafkaClusterId == k);
            }
        })
        
        setfilteredData(finalResult)
    }

    const clickHandler = (id) => navigate(`/capabilities/${id}`);

    useEffect(() => {

        const fetchTopics = async (c) => {
          const result = await getAllTopics();

          result.sort((a, b) => a.name.localeCompare(b.name));
          const finalTopics = result.map((topic) => {
            const copy = {...topic}
            const color = c.find(cluster => cluster.id === copy.kafkaClusterId);
            if(color != null) {
                copy.clusterColor = color.color;
            }
            return copy

          });
          
          setTopics(finalTopics);
          setfilteredData(finalTopics);
          setIsLoadingTopics(false);
        }

        fetchKafkaclusters().then((c) => fetchTopics(c));

    }, []);

    useEffect(() => {
        filter({
            target: {
                value: inputText
            }
        });

    }, [clustersMap, inputText]);


    return <>
        <br/>
        <br/>

        <PageSection headline={`Public Topics`}>
                
                <TextField
                    name="basic"
                    onChange={inputHandler}
                    prefix="Test"
                    placeholder="Search"
                    icon={<Search />}
                    help="I need some more help"
                    style={{ marginBottom: "-15px" }}
                />
                <div className={styles.container_checkboxes} >
                    <Text style= {{color: "#4d4e4cb3"}}><i>{filteredData.length} Results</i></Text>
                    <div className={styles.checkboxes} >
                        {
                            clusters.map(cluster => (
                                <Checkbox key={cluster.id} checked={clustersMap.get(cluster.id)} onChange={() => {
                                    updateClustersMap(cluster.id, !clustersMap.get(cluster.id))
                                    inputHandler({
                                            target: {
                                            value: inputText
                                            }
                                        });
                                    }}>
                                        {cluster.name}
                                </Checkbox>
                            ))
                        }
                    </div>
                </div>    

                {
                    isLoadingTopics
                    ? <Spinner instant/>
                    :
                        <>
                            {filteredData.map(x => <div key= {x.id} style={{marginBottom: "15px"}}><SearchView data={x}/></div>)}
                        </>
                               
                }
                        
        </PageSection>
            
    </>

}




export default function TopicsPage({}) {

    const splash = <CardMedia aspectRatio='3:2' media={
        <img src='https://images.pexels.com/photos/2873277/pexels-photo-2873277.jpeg' alt="" />
    } />
  
    return <>
        <br/>
        <br/>

        <Container>
            <Column m={12} l={12} xl={12} xxl={12}>
                <Text as={H1} styledAs='heroHeadline'>Public Topics</Text>
                <Card variant="fill" surface="main" size='xl' reverse={true} media={splash}>
                    <CardTitle largeTitle>Information</CardTitle>
                    <CardContent>
                    </CardContent>
                </Card>
                <Topics />
            </Column>
        </Container>
    </>
}