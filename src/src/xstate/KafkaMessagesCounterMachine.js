import { createMachine, assign } from "xstate";

const KafkaMessagesCounterMachine = createMachine({
  context: {
    count: 0,
  },
  on: {
    incrementCount: {
      actions: assign({
        count: ({ context }) => context.count + 1,
      }),
    },
    }   
  },
);

export default KafkaMessagesCounterMachine;