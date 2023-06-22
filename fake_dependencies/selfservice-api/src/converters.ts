import { Capability, Member, KafkaTopic, KafkaCluster, MessageContract, MembershipApplication, isMemberOf, isMemberOfCapability, canJoin, AwsAccount, hasAwsAccount } from "./data";
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
            clusters: {
                href: composeUrl(`/capabilities/${capability.id}/kafkaclusteraccess`),
                rel: "related",
                allow: ["GET"]
            },
            membershipApplications: {
                href: composeUrl(`/capabilities/${capability.id}/membershipapplications`),
                rel: "related",
                allow: isMemberOf(capability)
                    ? ["GET"]
                    : canJoin(capability) ? ["GET", "POST"] : ["GET"]
            },
            awsAccount: {
                href: composeUrl(`/capabilities/${capability.id}/awsaccount`),
                rel: "related",
                allow: isMemberOf(capability)
                    ? hasAwsAccount(capability) ? ["GET"] : ["GET", "POST"]
                    : ["GET"]
            }
        }
    };
}

export function convertMember(member: Member) : any {
    return {
        id: member.email,
        name: member.email,
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
                    allow: [
                        "GET",
                        topic.__canDelete ? "DELETE" : ""
                    ].filter(x => x != "")
                },
                messageContracts: {
                    href: composeUrl("kafkatopics", topic.id, "messagecontracts"),
                    rel: "related",
                    allow: [
                        "GET",
                        topic.name.startsWith("pub.") ? "POST" : ""
                    ].filter(x => x != "")
                },
                updateDescription: topic.__canUpdate 
                    ? {
                        href: composeUrl("kafkatopics", topic.id, "description"),
                        method: "PUT"
                    }
                    : null
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

export function convertMembershipApplication(memebrshipApplication: MembershipApplication) : any {
    const approvalAllow = [];
    if (isMemberOfCapability(memebrshipApplication.capabilityId)) {
        approvalAllow.push("GET");
    }
    if (memebrshipApplication.__canApprove) {
        approvalAllow.push("POST");
    }

    return {...memebrshipApplication, ...{
        "_links": {
            self: {
                href: composeUrl("membershipapplications", memebrshipApplication.id),
                rel: "self",
                allow: ["GET"]
            },
            approvals: {
                href: composeUrl("membershipapplications", memebrshipApplication.id, "approvals"),
                rel: "related",
                allow: approvalAllow
            }
        }
    }};
}

export function convertAwsAccount(account: AwsAccount) : any {
    console.log(account);

    return {
        id: account.id,
        capabilityId: account.capabilityId,
        accountId: account.accountId,
        roleEmail: account.roleEmail,
        namespace: account.namespace,
        status: account.status,
        "_links": {
            self: {
                href: composeUrl(`/capabilities/${account.capabilityId}/awsaccount`),
                rel: "self",
                allow: ["GET"]
            },
        }
    };
}