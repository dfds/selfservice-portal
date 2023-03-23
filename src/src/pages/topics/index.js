import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { getAllTopics } from "./../../SelfServiceApiClient";
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { Card, CardMedia, CardTitle, CardContent, CardActions, CardPriceTag } from '@dfds-ui/react-components'
import { Text } from '@dfds-ui/typography';
import { Tooltip, TextField } from '@dfds-ui/react-components';
import { Search } from '@dfds-ui/icons/system';
import {SearchView} from './SearchView'

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

    let inputHandler = (e) => {
        var lowerCase = e.target.value.toLowerCase();
        const highlightedData = topics.map((topic) =>  {
            const copy = {...topic};
            const index = copy.name.indexOf(lowerCase);
            if (index > -1) {
                copy.highlight = {
                    shouldBeHighlighted: true,
                    searchStr: lowerCase
                };
            }

            return copy

        });

        const finalResult = highlightedData.filter((el) => el.highlight != null );
        
        setfilteredData(finalResult)
    }

    const clickHandler = (id) => navigate(`/capabilities/${id}`);

    useEffect(() => {

        const fetchTopics = async () => {
          const result = await getAllTopics();

          setTopics(result)
          setfilteredData(result)
        }

        fetchTopics();
    }, []);

         
    


    return <>
        <br/>
        <br/>


        <Text styledAs='sectionHeadline'>Public Topics</Text>
        <Card variant="fill"  surface="main">
            <CardContent>
                    <TextField
                        name="basic"
                        onChange={inputHandler}
                        prefix="Test"
                        placeholder="Search"
                        icon={<Search />}
                        help="I need some more help"
                        style={{ marginBottom: "-15px" }}
                    />
                    {/* <Table isHeaderSticky isInteractive width={"100%"}>
                         <TableHead>
                             <TableRow>
                                 <TableHeaderCell>Capability</TableHeaderCell>
                                 <TableHeaderCell>Topic name</TableHeaderCell>
                                 <TableHeaderCell>ClusterId</TableHeaderCell>
                                 <TableHeaderCell>Description</TableHeaderCell>
                             </TableRow>
                         </TableHead>
                     <TableBody>
                         {filteredData.map(x => <TableRow key={x.name + x.id}>
                             <TableDataCell  onClick={() => clickHandler(x.capabilityId)}>{x.capabilityId}</TableDataCell>
                             <TableDataCell>{highlightedName(x.name, x.highlight)}</TableDataCell>
                             <TableDataCell>{x.kafkaClusterId}</TableDataCell>
                             <TableDataCell>{x.description}</TableDataCell>
                             </TableRow> 
                         )}             
                     </TableBody>
                    </Table> */}
                    <Text style= {{color: "#4d4e4cb3"}}><i>{filteredData.length} Results</i></Text>
                    {filteredData.map(x => <div style={{marginBottom: "15px"}}><SearchView data={x}/></div>)}
                    
            </CardContent>
        </Card>
    </>
}