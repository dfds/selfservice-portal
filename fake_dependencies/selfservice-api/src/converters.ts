import { Capability, Member, KafkaTopic, KafkaCluster, MessageContract } from "./data";
import { composeUrl } from "./helpers";

export function convertCapability(capability: Capability) : any {
    return {
        id: capability.id,
        name: capability.name,
        description: capability.description,
        "_links": {
            self: {
                href: composeUrl(`/capabilities/${capability.id}`),
                rel: "self",
                allow: ["GET"]
            },
            members: {
                href: composeUrl(`/capabilities/${capability.id}/members`),
                rel: "related",
                allow: ["GET"]
            },
            topics: {
                href: composeUrl(`/capabilities/${capability.id}/topics`),
                rel: "related",
                allow: capability.id === "this-is-a-capability-xyz" 
                    ? ["GET", "POST"]
                    : ["GET"]
            },
            membershipApplications: {
                href: composeUrl(`/capabilities/${capability.id}/membershipapplications`),
                rel: "related",
                allow: capability.id === "this-is-a-capability-xyz" 
                    ? ["GET", "POST"]
                    : ["GET"]
            }
        }
    };
}

export function convertMember(member: Member) : any {
    return {
        id: member.email,
        email: member.email,
    };
}

export function convertKafkaTopic(topic: KafkaTopic) : any {
    return {
        ...topic, ...{
            "_links": {
                self: {
                    href: composeUrl("kafkatopics", topic.id),
                    rel: "self",
                    allow: ["GET"]
                },
                messageContracts: {
                    href: composeUrl("kafkatopics", topic.id, "messagecontracts"),
                    rel: "related",
                    allow: [
                        "GET",
                        topic.name.startsWith("pub.") ? "POST" : ""
                    ].filter(x => x != "")
                }
            }
        }
    };
}

export function convertKafkaCluster(kafkaCluster: KafkaCluster) : any {
    return {...kafkaCluster, ...{
        "_links": {
            self: {
                href: composeUrl("kafkaclusters", kafkaCluster.id),
                rel: "self",
                allow: ["GET"]
            }
        }        
    }};
}

export function convertMessageContract(messageContract: MessageContract) : any {
    return {...messageContract, ...{
        "_links": {
            self: {
                href: composeUrl("kafkatopics", messageContract.kafkaTopicId, messageContract.id),
                rel: "self",
                allow: ["GET"]
            }
        }        
    }};
}