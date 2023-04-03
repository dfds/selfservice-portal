import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { getAllTopics } from "./../../SelfServiceApiClient";
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { Card, CardMedia, CardTitle, CardContent, CardActions, CardPriceTag } from '@dfds-ui/react-components'
import { Text } from '@dfds-ui/typography';
import { Tooltip, TextField } from '@dfds-ui/react-components';
import { Search } from '@dfds-ui/icons/system';
import {SearchView} from './SearchView';
import { CheckboxGroup, Checkbox } from '@dfds-ui/forms/checkbox';
import styles from "./topic.module.css";

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




export default function TopicsPage({}) {

    const [topics, setTopics] = useState([]);
    const [filteredData, setfilteredData] = useState([]);
    const navigate = useNavigate();
    const [inputText, setInputText] = useState(""); 
    const [inputProd, setinputProd] = useState(false);
    const [inputDev, setinputDev] = useState(false);

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
        console.log(inputProd);

        if (inputProd == true) {
            console.log(finalResult);
            finalResult = finalResult.filter((el) => el.kafkaClusterId == "kc-2");
        } 

        if (inputDev == true) {
            finalResult = finalResult.filter((el) => el.kafkaClusterId == "kc-1");
        } 
        
        setfilteredData(finalResult)
    }

    const clickHandler = (id) => navigate(`/capabilities/${id}`);

    useEffect(() => {

        const fetchTopics = async () => {
          const result = await getAllTopics();

          result.sort((a, b) => a.name.localeCompare(b.name));

          setTopics(result)
          setfilteredData(result)
        }

        fetchTopics();
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

        <Text styledAs='sectionHeadline'>Public Topics</Text>

        <Card variant="fill"  surface="main">
            <CardContent>
                <div className={styles.container_checkboxes} >
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
                <TextField
                    name="basic"
                    onChange={inputHandler}
                    prefix="Test"
                    placeholder="Search"
                    icon={<Search />}
                    help="I need some more help"
                    style={{ marginBottom: "-15px" }}
                />
                <Text style= {{color: "#4d4e4cb3"}}><i>{filteredData.length} Results</i></Text>
                               
                {filteredData.map(x => <div key= {x.id} style={{marginBottom: "15px"}}><SearchView data={x}/></div>)}
                    
            </CardContent>
        </Card>
    </>
}