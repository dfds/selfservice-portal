import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { getAllTopics } from "./../../SelfServiceApiClient";
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
    const clickHandler = (id) => navigate(`/capabilities/${id}`);

    useEffect(() => {

        const fetchTopics = async () => {
          const result = await getAllTopics();  

          console.log(result); 
          
          setTopics(result)
        }

        fetchTopics();
    }, []);
    
    return <>
        <br/>
        <br/>

        
        <Table isInteractive>
            <TableHead>
                <TableRow>
                    <TableHeaderCell>Capability</TableHeaderCell>
                    <TableHeaderCell>Topic name</TableHeaderCell>
                    <TableHeaderCell>ClusterId</TableHeaderCell>
                    <TableHeaderCell>Description</TableHeaderCell>
                </TableRow>
            </TableHead>
        <TableBody>
            {topics.map(x => <TableRow key={x.name + x.id}>
                <TableDataCell  onClick={() => clickHandler(x.capabilityId)}>{x.capabilityName}</TableDataCell>
                <TableDataCell>{x.topic.name}</TableDataCell>
                <TableDataCell>{x.topic.kafkaClusterId}</TableDataCell>
                <TableDataCell>{x.topic.description}</TableDataCell>
                </TableRow> 
            )}             
        </TableBody>
    </Table>
    </>
}