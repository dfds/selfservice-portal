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
            retention: 1,
            status: "Provisioned"
          },
          {
            id: "2",
            name: "pub.this-is-a-capability-xyz.bar",
            description: "a public topic for bar stuff",
            kafkaClusterId: "kc-2",
            partitions: 3,
            retention: 1,
            status: "Provisioned"
          },
          {
            id: "3",
            name: "this-is-a-capability-xyz.a-foo",
            description: "a topic for a-foo stuff",
            kafkaClusterId: "kc-2",
            partitions: 3,
            retention: 1,
            status: "Provisioned"
          },
          {
            id: "4",
            name: "this-is-a-capability-xyz.b-foo",
            description: "a topic for b-foo stuff",
            kafkaClusterId: "kc-2",
            partitions: 3,
            retention: 1,
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
            retention: 1,
            status: "Provisioned"
          }
        ]
      },
  ];


export {kafkaClusters, capabilities};