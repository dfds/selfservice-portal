import React, { useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';
import Topic from "./topic";

const clusters = [
    {
        id: 1,
        name: "Production",
        topics: []
    },
    {
        id: 2,
        name: "Development",
        topics: []
    },
];

for (let i = 0; i < 10; i++) {
    clusters[0].topics.push({
        id: i,
        name: "pub.foo.bar.baz.qux-" + i,
        description: "n/a",
        partitions: 3,
        retention: 1000,
        isSelected: false,
    });
}

for (let i = 0; i < 5; i++) {
    clusters[1].topics.push({
        id: i,
        name: "foo.bar.baz.qux-" + i,
        description: "n/a",
        partitions: 3,
        retention: 1000,
        isSelected: false,
    });
}

clusters[0].topics[0].messages = [
    {
        id: 1,
        messageType: "new-booking-request-has-been-recieved",
        messageContract: `
        {
            "$schema": "http://json-schema.org/draft-04/schema#",
            "type": "object",
            "properties": {
              "messageId": {
                "type": "string"
              },
              "type": {
                "type": "string"
              },
              "data": {
                "type": "object",
                "properties": {
                  "bookingId": {
                    "type": "string"
                  },
                  "customerNumber": {
                    "type": "string"
                  }
                },
                "required": [
                  "bookingId",
                  "customerNumber"
                ]
              }
            },
            "required": [
              "messageId",
              "type",
              "data"
            ]
          }        
        `,
        description: "n/a",
        isSelected: true,
    },
    {
        id: 2,
        messageType: "booking-request-has-been-cancelled",
        messageContract: "",
        description: "n/a",
        isSelected: false,
    }
];

export default function Topics({}) {
    const [state, setState] = useState(clusters);
    const selectTopic = (cid, tid) => setState(prev => {
        const newState = [...prev];
        const cluster = newState.find(x => x.id == cid);

        if (cluster) {

            cluster.topics.forEach(topic => {
                if (topic.id == tid) {
                    topic.isSelected = !topic.isSelected;
                } else {
                    topic.isSelected = false;
                }
            });
        }

        return newState;
    });

    return <>
        <Text styledAs='sectionHeadline'>Topics</Text>
        <Card variant="fill" surface="main">
            <CardContent>
                {state.map(cluster => <div key={cluster.id}>
                    <Text styledAs='subHeadline'>{cluster.name}</Text>
                    {(cluster.topics || []).length == 0 && <div>No topics...yet!</div>}
                    {(cluster.topics || []).map(topic => <Topic 
                        key={`${cluster.id}-${topic.id}`} 
                        {...topic} 
                        onHeaderClicked={topicId => selectTopic(cluster.id, topicId)}
                    />)}
                </div>)}
            </CardContent>
        </Card>
    </>
}