import { getDate } from "./helpers";
export interface Capability {
  id: string,
  name: string,
  description: string,
  members: Member[],
  __isMember: boolean,
  __canJoin: boolean,
  __hasAwsAccount: boolean
}

export interface Member {
  email: string
}

export interface KafkaTopic {
  id: string,
  capabilityId: string,
  name: string,
  description: string,
  kafkaClusterId: string,
  partitions: number,
  retention: string,
  status: string,
  __canUpdate: boolean,
  __canDelete: boolean,
}

export interface MessageContract {
  id: string,
  kafkaTopicId: string,
  messageType: string,
  description: string,
  schema: string,
  example: string,
  status: string,
}

export interface MembershipApplication {
  id: string,
  capabilityId: string,
  applicant: string,
  approvals: MembershipApplicationApproval[],
  status: string,
  submittedAt: string,
  expiresOn: string,
  __canApprove: boolean,
}

export interface MembershipApplicationApproval {
  id: string,
  approvedBy: string,
  approvedAt: string,
}

export interface KafkaCluster {
  id: string,
  name: string,
  description: string,
}

export interface KafkaClusterAccess {
  id: string,
  capabilityId: string,
  kafkaClusterId: string,
}

export interface AwsAccount {
  id: string,
  capabilityId: string,
  accountId: string | null,
  roleEmail: string | null,
  namespace: string | null,
  status: AwsAccountStatus, // Requested, Pending, Completed
}

export enum AwsAccountStatus {
  Requested = "Requested",
  Pending = "Pending",
  Completed = "Completed",
}

export interface Stat {
  title: string,
  value: number
}

const stats: Stat[] = [
  {
    title: "Capabilities",
    value: 198
  },
  {
    title: "AWS Accounts",
    value: 106
  },
  {
    title: "Kubernetes Clusters",
    value: 1
  },
  {
    title: "Kafka Clusters",
    value: 2
  },
  {
    title: "Public Topics",
    value: 325
  },
  {
    title: "Private Topics",
    value: 518
  },
];

const awsAccounts: AwsAccount[] = [
  {
    id: "1",
    capabilityId: "this-is-a-capability-xyz",
    accountId: "123456789012",
    roleEmail: "role@lemail.com",
    namespace: "this-is-a-capability-xyz",
    status: AwsAccountStatus.Completed,
  }
]

const kafkaClusters: KafkaCluster[] = [
    {
      id: "kc-1",
      name: "Dev",
      description: "This cluster is for non-production workloads and used in various staging environments. Please note, you should not consume messages in this cluster from your production workloads!",
    },
    {
      id: "kc-2",
      name: "Prod",
      description: "This is the production cluster used for production workloads. This cluster has the highes resource allocations and is used for business critical messages.",
    }
  ];

const kafkaClusterAccess: KafkaClusterAccess[] = [
  {
    id: "kca-1",
    capabilityId: "this-is-a-capability-xyz",
    kafkaClusterId: "kc-1",
  },
  {
    id: "kca-2",
    capabilityId: "this-is-a-capability-xyz",
    kafkaClusterId: "kc-2",
  }
];


const kafkaTopics : KafkaTopic[] = [
  {
    id: "1",
    capabilityId: "this-is-a-capability-xyz",
    name: "this-is-a-capability-xyz.foo",
    description: "this is a foo topic for foo stuff",
    kafkaClusterId: "kc-2",
    partitions: 3,
    retention: "1d",
    status: "Provisioned",
    __canUpdate: true,
    __canDelete: true,
  },
  {
    id: "2",
    capabilityId: "this-is-a-capability-xyz",
    name: "pub.this-is-a-capability-xyz.bar",
    description: "a public topic for bar stuff",
    kafkaClusterId: "kc-2",
    partitions: 3,
    retention: "1d",
    status: "Provisioned",
    __canUpdate: true,
    __canDelete: false,
  },
  {
    id: "3",
    capabilityId: "this-is-a-capability-xyz",
    name: "this-is-a-capability-xyz.a-foo",
    description: "a topic for a-foo stuff",
    kafkaClusterId: "kc-2",
    partitions: 3,
    retention: "1d",
    status: "Provisioned",
    __canUpdate: true,
    __canDelete: true,
  },
  {
    id: "4",
    capabilityId: "this-is-a-capability-xyz",
    name: "this-is-a-capability-xyz.b-foo",
    description: "a topic for b-foo stuff",
    kafkaClusterId: "kc-2",
    partitions: 3,
    retention: "1d",
    status: "In Progress",
    __canUpdate: false,
    __canDelete: false,
  },
  {
    id: "5",
    capabilityId: "another-awssome-capability-abcd",
    name: "another-awssome-capability-abcd.name-of-topic",
    description: "just a dummy topic",
    kafkaClusterId: "kc-2",
    partitions: 3,
    retention: "1d",
    status: "Provisioned",
    __canUpdate: false,
    __canDelete: false,
  },
  {
    id: "6",
    capabilityId: "another-awssome-capability-abcd",
    name: "pub.another-awssome-capability-abcd.hrisy",
    description: "just a dummy topic",
    kafkaClusterId: "kc-2",
    partitions: 3,
    retention: "1d",
    status: "Provisioned",
    __canUpdate: false,
    __canDelete: false,
  },
  {
    id: "7",
    capabilityId: "this-is-a-capability-xyz",
    name: "pub.this-is-a-capability-xyz.foo",
    description: "just another dummy topic",
    kafkaClusterId: "kc-1",
    partitions: 3,
    retention: "1d",
    status: "Provisioned",
    __canUpdate: true,
    __canDelete: false,
  },
  {
    id: "8",
    capabilityId: "another-awssome-capability-abcd",
    name: "pub.another-awssome-capability-abcd.foo-foo",
    description: "just another dummy topic",
    kafkaClusterId: "kc-1",
    partitions: 3,
    retention: "1d",
    status: "Provisioned",
    __canUpdate: false,
    __canDelete: false,
  }
];

const messageContracts : MessageContract[] = [
  {
    id: "1",
    kafkaTopicId: "2",
    messageType: "topic-requested",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas feugiat tempus arcu. Sed maximus est.",
    schema: "{\r\n    \"$schema\": \"https:\/\/json-schema.org\/draft\/2019-09\/schema\",\r\n    \"$id\": \"http:\/\/example.com\/example.json\",\r\n    \"type\": \"object\",\r\n    \"default\": {},\r\n    \"title\": \"Root Schema\",\r\n    \"required\": [\r\n        \"messageId\",\r\n        \"type\",\r\n        \"causationId\",\r\n        \"correlationId\",\r\n        \"data\"\r\n    ],\r\n    \"properties\": {\r\n        \"messageId\": {\r\n            \"type\": \"string\",\r\n            \"default\": \"\",\r\n            \"title\": \"The messageId Schema\",\r\n            \"examples\": [\r\n                \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\"\r\n            ]\r\n        },\r\n        \"type\": {\r\n            \"type\": \"string\",\r\n            \"default\": \"\",\r\n            \"title\": \"The type Schema\",\r\n            \"examples\": [\r\n                \"new-kafka-topic-has-been-requested\"\r\n            ]\r\n        },\r\n        \"causationId\": {\r\n            \"type\": \"string\",\r\n            \"default\": \"\",\r\n            \"title\": \"The causationId Schema\",\r\n            \"examples\": [\r\n                \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\"\r\n            ]\r\n        },\r\n        \"correlationId\": {\r\n            \"type\": \"string\",\r\n            \"default\": \"\",\r\n            \"title\": \"The correlationId Schema\",\r\n            \"examples\": [\r\n                \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\"\r\n            ]\r\n        },\r\n        \"data\": {\r\n            \"type\": \"object\",\r\n            \"default\": {},\r\n            \"title\": \"The data Schema\",\r\n            \"required\": [\r\n                \"kafkaTopicId\",\r\n                \"kafkaTopicName\",\r\n                \"kafkaClusterId\",\r\n                \"capabilityId\",\r\n                \"partitions\",\r\n                \"retention\"\r\n            ],\r\n            \"properties\": {\r\n                \"kafkaTopicId\": {\r\n                    \"type\": \"string\",\r\n                    \"default\": \"\",\r\n                    \"title\": \"The kafkaTopicId Schema\",\r\n                    \"examples\": [\r\n                        \"d5c2d87cb522441b88c25aad762bc3d3\"\r\n                    ]\r\n                },\r\n                \"kafkaTopicName\": {\r\n                    \"type\": \"string\",\r\n                    \"default\": \"\",\r\n                    \"title\": \"The kafkaTopicName Schema\",\r\n                    \"examples\": [\r\n                        \"pub.cloudengineering-foo-zxcv.a-new-topic\"\r\n                    ]\r\n                },\r\n                \"kafkaClusterId\": {\r\n                    \"type\": \"string\",\r\n                    \"default\": \"\",\r\n                    \"title\": \"The kafkaClusterId Schema\",\r\n                    \"examples\": [\r\n                        \"prod1\"\r\n                    ]\r\n                },\r\n                \"capabilityId\": {\r\n                    \"type\": \"string\",\r\n                    \"default\": \"\",\r\n                    \"title\": \"The capabilityId Schema\",\r\n                    \"examples\": [\r\n                        \"cloudengineering-foo-zxcv\"\r\n                    ]\r\n                },\r\n                \"partitions\": {\r\n                    \"type\": \"integer\",\r\n                    \"default\": 0,\r\n                    \"title\": \"The partitions Schema\",\r\n                    \"examples\": [\r\n                        1\r\n                    ]\r\n                },\r\n                \"retention\": {\r\n                    \"type\": \"string\",\r\n                    \"default\": \"\",\r\n                    \"title\": \"The retention Schema\",\r\n                    \"examples\": [\r\n                        \"1d\"\r\n                    ]\r\n                }\r\n            },\r\n            \"examples\": [{\r\n                \"kafkaTopicId\": \"d5c2d87cb522441b88c25aad762bc3d3\",\r\n                \"kafkaTopicName\": \"pub.cloudengineering-foo-zxcv.a-new-topic\",\r\n                \"kafkaClusterId\": \"prod1\",\r\n                \"capabilityId\": \"cloudengineering-foo-zxcv\",\r\n                \"partitions\": 1,\r\n                \"retention\": \"1d\"\r\n            }]\r\n        }\r\n    },\r\n    \"examples\": [{\r\n        \"messageId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n        \"type\": \"new-kafka-topic-has-been-requested\",\r\n        \"causationId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n        \"correlationId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n        \"data\": {\r\n            \"kafkaTopicId\": \"d5c2d87cb522441b88c25aad762bc3d3\",\r\n            \"kafkaTopicName\": \"pub.cloudengineering-foo-zxcv.a-new-topic\",\r\n            \"kafkaClusterId\": \"prod1\",\r\n            \"capabilityId\": \"cloudengineering-foo-zxcv\",\r\n            \"partitions\": 1,\r\n            \"retention\": \"1d\"\r\n        }\r\n    }]\r\n}",
    example: "{\r\n    \"messageId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n    \"type\": \"topic-requested\",\r\n    \"causationId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n    \"correlationId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n    \"data\": {\r\n        \"kafkaTopicId\": \"d5c2d87cb522441b88c25aad762bc3d3\",\r\n        \"kafkaTopicName\": \"pub.cloudengineering-foo-zxcv.a-new-topic\",\r\n        \"kafkaClusterId\": \"prod1\",\r\n        \"capabilityId\": \"cloudengineering-foo-zxcv\",\r\n        \"partitions\": 1,\r\n        \"retention\": \"1d\"\r\n    }\r\n}",
    status: "Provisioned",
  },
  {
    id: "2",
    kafkaTopicId: "2",
    messageType: "kafka-topic-has-been-provisioned",
    description: "Aenean est turpis, volutpat id leo vitae, dapibus congue nisi.",
    schema: "<schema>",
    example: "<example>",
    status: "Provisioned",
  },
  {
    id: "3",
    kafkaTopicId: "2",
    messageType: "another-message",
    description: "Aenean est turpis, volutpat id leo vitae, dapibus congue nisi.",
    schema: "<schema>",
    example: "<example>",
    status: "In Progress",
  }
];

const capabilities : Capability[] = [
      {
        id: "this-is-a-capability-xyz",
        name: "this is a capability",
        description: "lksd lskd flskdnf lskerntolweirhtn lis dflk slkdmf",
        members: [
          {
            email: "jandr@dfds.com"
          },
          {
            email: "thfis@dfds.com"
          },
        ],
        __isMember: true,
        __canJoin: false,
        __hasAwsAccount: true
      },
      {
        id: "another-awssome-capability-abcd",
        name: "another awssome capability",
        description: "lknm lk23lnk nl kl23lk lk",
        members: [
          {
            email: "thfis@dfds.com"
          },
        ],
        __isMember: false,
        __canJoin: true,
        __hasAwsAccount: false
      },
      {
        id: "my-second-capability",
        name: "My Second Capability",
        description: "Integer enim neque volutpat ac tincidunt vitae semper quis lectus nulla at volutpat diam ut",
        members: [
          {
            email: "jandr@dfds.com"
          },
          {
            email: "thfis@dfds.com"
          },
        ],
        __isMember: true,
        __canJoin: false,
        __hasAwsAccount: false
      },
      {
        id: "my-future-capability",
        name: "My Future Capability",
        description: "Vel facilisis volutpat est velit egestas dui id ornare arcu odio ut sem nulla pharetra diam sit amet nisl suscipit adipiscing bibendum est ultricies integer quis auctor elit sed vulputate",
        members: [
          {
            email: "jawib@dfds.com"
          },
        ],
        __isMember: false,
        __canJoin: false,
        __hasAwsAccount: false
      },
];

const membershipApplications : MembershipApplication[] = [
  {
    id: "1",
    capabilityId: "this-is-a-capability-xyz",
    applicant: "pausegh@dfds.com",
    approvals: [],
    status: "Pending",
    submittedAt: getDate(-1).toISOString(),
    expiresOn: getDate(7).toISOString(),
    __canApprove: false,
  },
  {
    id: "2",
    capabilityId: "this-is-a-capability-xyz",
    applicant: "hritote@dfds.com",
    approvals: [],
    status: "Pending",
    submittedAt: getDate(-7).toISOString(),
    expiresOn: getDate(7).toISOString(),
    __canApprove: false,
  },
  {
    id: "3",
    capabilityId: "this-is-a-capability-xyz",
    applicant: "jawib@dfds.com",
    approvals: [],
    status: "Pending",
    submittedAt: getDate(-12).toISOString(),
    expiresOn: getDate(2).toISOString(),
    __canApprove: true,
  },
  {
    id: "4",
    capabilityId: "my-future-capability",
    applicant: "jandr@dfds.com",
    approvals: [],
    status: "Pending",
    submittedAt: getDate(-12).toISOString(),
    expiresOn: getDate(2).toISOString(),
    __canApprove: false,
  },
];

export interface State {
  kafkaClusters: KafkaCluster[],
  kafkaClustersAccess: KafkaClusterAccess[],
  kafkaTopics: KafkaTopic[],
  capabilities: Capability[],
  messageContracts: MessageContract[],
  stats: Stat[],
  membershipApplications: MembershipApplication[],
  awsAccounts: AwsAccount[],
}

export const state : State = {
  capabilities: capabilities,
  kafkaClusters: kafkaClusters,
  kafkaTopics: kafkaTopics,
  messageContracts: messageContracts,
  stats: stats,
  membershipApplications: membershipApplications,
  awsAccounts: awsAccounts,
  kafkaClustersAccess: kafkaClusterAccess
};

export function canJoin(capability: Capability) : boolean {
  return capability.__canJoin;
}

export function isMemberOf(capability: Capability) : boolean {
  return capability.__isMember;
}

export function hasAwsAccount(capability: Capability) : boolean {
  return capability.__hasAwsAccount;
}

export function isMemberOfCapability(capabilityId: string) : boolean {
  const found = state.capabilities.find(x => x.id === capabilityId);
  if (found) {
      return found.__isMember;
  }

  return false;
}