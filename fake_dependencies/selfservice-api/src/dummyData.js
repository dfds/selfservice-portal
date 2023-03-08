const kafkaClusters = [
    {
      id: "kc-1",
      name: "Development",
      description: "This cluster is for non-production workloads and used in various staging environments. Please note, you should not consume messages in this cluster from your production workloads!",
    },
    {
      id: "kc-2",
      name: "Production",
      description: "This is the production cluster used for production workloads. This cluster has the highes resource allocations and is used for business critical messages.",
    }
  ];


const capabilities = [
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
        topics: [
          {
            id: "1",
            name: "this-is-a-capability-xyz.foo",
            description: "this is a foo topic for foo stuff",
            kafkaClusterId: "kc-2",
            partitions: 3,
            retention: "1d",
            status: "Provisioned"
          },
          {
            id: "2",
            name: "pub.this-is-a-capability-xyz.bar",
            description: "a public topic for bar stuff",
            kafkaClusterId: "kc-2",
            partitions: 3,
            retention: "1d",
            status: "Provisioned",
            messageContracts: [
              {
                id: "1",
                messageType: "new-kafka-topic-has-been-requested",
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas feugiat tempus arcu. Sed maximus est.",
                schema: "{\r\n    \"$schema\": \"https:\/\/json-schema.org\/draft\/2019-09\/schema\",\r\n    \"$id\": \"http:\/\/example.com\/example.json\",\r\n    \"type\": \"object\",\r\n    \"default\": {},\r\n    \"title\": \"Root Schema\",\r\n    \"required\": [\r\n        \"messageId\",\r\n        \"type\",\r\n        \"causationId\",\r\n        \"correlationId\",\r\n        \"data\"\r\n    ],\r\n    \"properties\": {\r\n        \"messageId\": {\r\n            \"type\": \"string\",\r\n            \"default\": \"\",\r\n            \"title\": \"The messageId Schema\",\r\n            \"examples\": [\r\n                \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\"\r\n            ]\r\n        },\r\n        \"type\": {\r\n            \"type\": \"string\",\r\n            \"default\": \"\",\r\n            \"title\": \"The type Schema\",\r\n            \"examples\": [\r\n                \"new-kafka-topic-has-been-requested\"\r\n            ]\r\n        },\r\n        \"causationId\": {\r\n            \"type\": \"string\",\r\n            \"default\": \"\",\r\n            \"title\": \"The causationId Schema\",\r\n            \"examples\": [\r\n                \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\"\r\n            ]\r\n        },\r\n        \"correlationId\": {\r\n            \"type\": \"string\",\r\n            \"default\": \"\",\r\n            \"title\": \"The correlationId Schema\",\r\n            \"examples\": [\r\n                \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\"\r\n            ]\r\n        },\r\n        \"data\": {\r\n            \"type\": \"object\",\r\n            \"default\": {},\r\n            \"title\": \"The data Schema\",\r\n            \"required\": [\r\n                \"kafkaTopicId\",\r\n                \"kafkaTopicName\",\r\n                \"kafkaClusterId\",\r\n                \"capabilityId\",\r\n                \"partitions\",\r\n                \"retention\"\r\n            ],\r\n            \"properties\": {\r\n                \"kafkaTopicId\": {\r\n                    \"type\": \"string\",\r\n                    \"default\": \"\",\r\n                    \"title\": \"The kafkaTopicId Schema\",\r\n                    \"examples\": [\r\n                        \"d5c2d87cb522441b88c25aad762bc3d3\"\r\n                    ]\r\n                },\r\n                \"kafkaTopicName\": {\r\n                    \"type\": \"string\",\r\n                    \"default\": \"\",\r\n                    \"title\": \"The kafkaTopicName Schema\",\r\n                    \"examples\": [\r\n                        \"pub.cloudengineering-foo-zxcv.a-new-topic\"\r\n                    ]\r\n                },\r\n                \"kafkaClusterId\": {\r\n                    \"type\": \"string\",\r\n                    \"default\": \"\",\r\n                    \"title\": \"The kafkaClusterId Schema\",\r\n                    \"examples\": [\r\n                        \"prod1\"\r\n                    ]\r\n                },\r\n                \"capabilityId\": {\r\n                    \"type\": \"string\",\r\n                    \"default\": \"\",\r\n                    \"title\": \"The capabilityId Schema\",\r\n                    \"examples\": [\r\n                        \"cloudengineering-foo-zxcv\"\r\n                    ]\r\n                },\r\n                \"partitions\": {\r\n                    \"type\": \"integer\",\r\n                    \"default\": 0,\r\n                    \"title\": \"The partitions Schema\",\r\n                    \"examples\": [\r\n                        1\r\n                    ]\r\n                },\r\n                \"retention\": {\r\n                    \"type\": \"string\",\r\n                    \"default\": \"\",\r\n                    \"title\": \"The retention Schema\",\r\n                    \"examples\": [\r\n                        \"1d\"\r\n                    ]\r\n                }\r\n            },\r\n            \"examples\": [{\r\n                \"kafkaTopicId\": \"d5c2d87cb522441b88c25aad762bc3d3\",\r\n                \"kafkaTopicName\": \"pub.cloudengineering-foo-zxcv.a-new-topic\",\r\n                \"kafkaClusterId\": \"prod1\",\r\n                \"capabilityId\": \"cloudengineering-foo-zxcv\",\r\n                \"partitions\": 1,\r\n                \"retention\": \"1d\"\r\n            }]\r\n        }\r\n    },\r\n    \"examples\": [{\r\n        \"messageId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n        \"type\": \"new-kafka-topic-has-been-requested\",\r\n        \"causationId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n        \"correlationId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n        \"data\": {\r\n            \"kafkaTopicId\": \"d5c2d87cb522441b88c25aad762bc3d3\",\r\n            \"kafkaTopicName\": \"pub.cloudengineering-foo-zxcv.a-new-topic\",\r\n            \"kafkaClusterId\": \"prod1\",\r\n            \"capabilityId\": \"cloudengineering-foo-zxcv\",\r\n            \"partitions\": 1,\r\n            \"retention\": \"1d\"\r\n        }\r\n    }]\r\n}",
                example: "{\r\n    \"messageId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n    \"type\": \"new-kafka-topic-has-been-requested\",\r\n    \"causationId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n    \"correlationId\": \"4b7f82e0-9a3d-400d-97d0-2cecfa929181\",\r\n    \"data\": {\r\n        \"kafkaTopicId\": \"d5c2d87cb522441b88c25aad762bc3d3\",\r\n        \"kafkaTopicName\": \"pub.cloudengineering-foo-zxcv.a-new-topic\",\r\n        \"kafkaClusterId\": \"prod1\",\r\n        \"capabilityId\": \"cloudengineering-foo-zxcv\",\r\n        \"partitions\": 1,\r\n        \"retention\": \"1d\"\r\n    }\r\n}",
              },
              {
                id: "2",
                messageType: "kafka-topic-has-been-provisioned",
                description: "Aenean est turpis, volutpat id leo vitae, dapibus congue nisi.",
                schema: "<schema>",
                example: "<example>",
              }
            ]            
          },
          {
            id: "3",
            name: "this-is-a-capability-xyz.a-foo",
            description: "a topic for a-foo stuff",
            kafkaClusterId: "kc-2",
            partitions: 3,
            retention: "1d",
            status: "Provisioned"
          },
          {
            id: "4",
            name: "this-is-a-capability-xyz.b-foo",
            description: "a topic for b-foo stuff",
            kafkaClusterId: "kc-2",
            partitions: 3,
            retention: "1d",
            status: "In Progress"
          }
        ]
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
        topics: [
          {
            id: "3",
            name: "another-awssome-capability-abcd.name-of-topic",
            description: "just a dummy topic",
            kafkaClusterId: "kc-2",
            partitions: 3,
            retention: "1d",
            status: "Provisioned"
          }
        ]
      },
  ];


export {kafkaClusters, capabilities};