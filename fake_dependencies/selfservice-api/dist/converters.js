"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMessageContract = exports.convertKafkaCluster = exports.convertKafkaTopic = exports.convertMember = exports.convertCapability = void 0;
const helpers_1 = require("./helpers");
function convertCapability(capability) {
    return {
        id: capability.id,
        name: capability.name,
        description: capability.description,
        "_links": {
            self: {
                href: (0, helpers_1.composeUrl)(`/capabilities/${capability.id}`),
                rel: "self",
                allow: ["GET"]
            },
            members: {
                href: (0, helpers_1.composeUrl)(`/capabilities/${capability.id}/members`),
                rel: "related",
                allow: ["GET"]
            },
            topics: {
                href: (0, helpers_1.composeUrl)(`/capabilities/${capability.id}/topics`),
                rel: "related",
                allow: capability.id === "1"
                    ? ["GET", "POST"]
                    : ["GET"]
            },
            membershipApplications: {
                href: (0, helpers_1.composeUrl)(`/capabilities/${capability.id}/membershipapplications`),
                rel: "related",
                allow: capability.id === "1"
                    ? ["GET", "POST"]
                    : ["GET"]
            }
        }
    };
}
exports.convertCapability = convertCapability;
function convertMember(member) {
    return {
        id: member.email,
        email: member.email,
    };
}
exports.convertMember = convertMember;
function convertKafkaTopic(topic) {
    return Object.assign(Object.assign({}, topic), {
        "_links": {
            self: {
                href: (0, helpers_1.composeUrl)("kafkatopics", topic.id),
                rel: "self",
                allow: ["GET"]
            },
            messageContracts: {
                href: (0, helpers_1.composeUrl)("kafkatopics", topic.id, "messagecontracts"),
                rel: "related",
                allow: [
                    "GET",
                    topic.name.startsWith("pub.") ? "POST" : ""
                ].filter(x => x != "")
            }
        }
    });
}
exports.convertKafkaTopic = convertKafkaTopic;
function convertKafkaCluster(kafkaCluster) {
    return Object.assign(Object.assign({}, kafkaCluster), {
        "_links": {
            self: {
                href: (0, helpers_1.composeUrl)("kafkaclusters", kafkaCluster.id),
                rel: "self",
                allow: ["GET"]
            }
        }
    });
}
exports.convertKafkaCluster = convertKafkaCluster;
function convertMessageContract(messageContract) {
    return Object.assign(Object.assign({}, messageContract), {
        "_links": {
            self: {
                href: (0, helpers_1.composeUrl)("kafkatopics", messageContract.kafkaTopicId, messageContract.id),
                rel: "self",
                allow: ["GET"]
            }
        }
    });
}
exports.convertMessageContract = convertMessageContract;
