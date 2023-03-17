import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { getAllTopics } from "./../../SelfServiceApiClient";
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { Card, CardMedia, CardTitle, CardContent, CardActions, CardPriceTag } from '@dfds-ui/react-components'
import { Text } from '@dfds-ui/typography';
import { Tooltip, TextField } from '@dfds-ui/react-components';
import { Search } from '@dfds-ui/icons/system';

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
    // let inputHandler = (e) => {
    //     var lowerCase = e.target.value.toLowerCase();
    //     setInputText(lowerCase);
    //     let data = topics.filter((el) => {
    //         return el.name.toLowerCase().includes(lowerCase)
    //     }
        
    //     );

    //     //Highlight matching text
    //     let highlightData = data.map((el) => {
    //         let regex = new RegExp(lowerCase, 'gi');
    //         let name = el.name.replace(regex, (match) => {
    //             return '<b>' + match + '</b>';
    //         });

    //         return el.name.toLowerCase()
    //     }

    //     )


    //     setfilteredData(highlightData)
    //     //console.log(filteredData)
    // }

    let inputHandler = (e) => {
        var lowerCase = e.target.value.toLowerCase();
        console.log(lowerCase)
        const highlightedData = topics.map((topic) =>  {
            const copy = {...topic};
            console.log(copy.name)
            const index = copy.name.indexOf(lowerCase);
            console.log(index)
            if (index > -1) {
                copy.highlight = {
                    start: index,
                    count: lowerCase.length
                };
            }

            return copy

        });

        const finalResult = highlightedData.filter((el) => el.highlight != null );
        

        setfilteredData(finalResult)
        console.log(filteredData)
    }
    const clickHandler = (id) => navigate(`/capabilities/${id}`);

    useEffect(() => {

        const fetchTopics = async () => {
          const result = await getAllTopics();

          console.log(result); 
          
          setTopics(result)
          setfilteredData(result)
        }

        fetchTopics();
    }, []);
    
    const highlightedName = (name, highlight) => {
        if (!highlight) {
            return <>{name}</>
        }
        console.log("start="+ highlight.start + "count="+ highlight.count )
        console.log("name="+name)
        const left = name.substring(0, highlight.start);
        console.log("Left="+left)
        const token = name.substring(highlight.start, highlight.start + highlight.count);
        console.log("Token="+token)
        const right = name.substring(highlight.start + highlight.count);
        console.log("Right="+right)

        return <>
            <span>{left}</span>
            <span style= {{backgroundColor: "yellow"}}>{token}</span>
            <span>{right}</span>
        </>
    };

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
                    />
                    <Table isHeaderSticky isInteractive width={"100%"}>
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
                    </Table>
            </CardContent>
        </Card>
    </>
}