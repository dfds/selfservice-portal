import { createMachine, assign } from "xstate";

const countMachine = createMachine({
  context: {
    count: 0,
    topic: [],
    selectedTopic: [],
  },
  on: {
    increment: {
      actions: assign({
        count: ({ context }) => context.count + 1,
      }),
    },
    decrement: {
      actions: assign({
        count: ({ context, event }) => context.count + event.value,
      }),
    },
    updateTopic: {
        actions: assign({
            topic: ({context, event}) => {
                console.log(event)
                return event.value
            },
        })
    },
    updateSelectedTopic: {
      actions: assign({
        selectedTopic: ({context, event}) => {
            return event.value
        },
    })
    }   
  },
});

// import { createMachine, assign, setup } from "xstate";
// const counterMachine = setup({
//     actions: {
//         increment: assign({
//           count: (context) => {
//             console.log("WEEEEEEEEE");
//             return context.count + 1;
//           },
//         }),
//         decrement: assign({ count: (context) => context.count - 1 }),
//       },
// }).createMachine({
//   id: "counter",
//   initial: "idle",
//   context: {
//     count: 0,
//   },
//   states: {
//     idle: {
//       on: {
//         INCREMENT: {
//           actions: "increment",
//         },
//         DECREMENT: {
//           actions: "decrement",
//           // cond: 'canDecrement', // Guard to prevent negative count
//         },
//       },
//     },
//   },

//   // guards: {
//   //   canDecrement: (context) => context.count > 0, // Guard for decrement
//   // },
// });

export default countMachine;
