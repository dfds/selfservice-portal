import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { getAllTopics, getKafkaClusters } from "./../../SelfServiceApiClient";
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { Container, Column, Card, CardMedia, CardTitle, CardContent, CardActions, CardPriceTag } from '@dfds-ui/react-components'
import { Text } from '@dfds-ui/typography';
import { Tooltip, TextField } from '@dfds-ui/react-components';
import { Search } from '@dfds-ui/icons/system';
import {SearchView} from './SearchView';
import { CheckboxGroup, Checkbox } from '@dfds-ui/forms/checkbox';
import styles from "./topic.module.css";
import { Spinner } from '@dfds-ui/react-components';
import { Button, H1, Input } from '@dfds-ui/react-components';
import PageSection from "components/PageSection";

// const topics = [
//     {
//         id: 1,
//         capability: "Alhan",
//         name: "pub.alhan-meopj.test-kafka",
//         cluster: "lkc-4npj6",
//         descriptuion: "dcdsccwwcw"
//     },
//     {
//         id: 2,
//         capability: "ControlCapacity",
//         name: "pub.controlcapacity-xgoja.addon-dev",
//         cluster: "lkc-3wqzw",
//         descriptuion: "Contains events for Seabook addons"
//     }
// ];


function Topics() {

    const [topics, setTopics] = useState([]);
    const [filteredData, setfilteredData] = useState([]);
    const navigate = useNavigate();
    const [inputText, setInputText] = useState(""); 
    const [inputProd, setinputProd] = useState(false);
    const [inputDev, setinputDev] = useState(false);
    const [isLoadingTopics, setIsLoadingTopics] = useState(true);
    const [clusters, setClusters] = useState([]);
    const colors = ['#ED8800', '#4caf50', 'blue', 'yellow', 'purple'];


    const fetchKafkaclusters = async () => {
        const result = await getKafkaClusters();
        const clustersWithColor = result.map((cluster, index) => {
            const color = colors[index % colors.length];
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

        if (inputProd == true) {
            finalResult = finalResult.filter((el) => el.kafkaClusterId == "kc-2");
        } 

        if (inputDev == true) {
            finalResult = finalResult.filter((el) => el.kafkaClusterId == "kc-1");
        } 
        
        setfilteredData(finalResult)
    }

    const clickHandler = (id) => navigate(`/capabilities/${id}`);

    useEffect(() => {

        const fetchTopics = async (c) => {
          const result = await getAllTopics();

          result.sort((a, b) => a.name.localeCompare(b.name));
          const finalTipics = result.map((topic) => {
            const copy = {...topic}
            console.log(c);
            const color = c.find(cluster => cluster.id === copy.kafkaClusterId);
            if(color != null) {
                copy.clusterColor = color.color;
            }
            return copy


          })
          

          setTopics(finalTipics);
          console.log(finalTipics);
          setfilteredData(finalTipics);
          setIsLoadingTopics(false);
        }

        fetchKafkaclusters().then((c) => fetchTopics(c));

        //console.log(clusters);

        

        //fetchTopics();
    }, []);

    useEffect(() => {
        filter({
            target: {
                value: inputText
            }
        });

    }, [inputProd, inputDev, inputText]);


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
                        <Checkbox name="checkboxProd" checked={inputProd} onChange={() => {
                            setinputProd(prevState => !prevState);
                            inputHandler({
                                    target: {
                                    value: inputText
                                    }
                                });
                            }}>
                            Prod
                        </Checkbox>
                        <Checkbox name="checkboxDev" checked={inputDev} onChange={() => setinputDev(prevState =>!prevState)}>
                            Dev
                        </Checkbox>
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