import React from "react";
import {
    Button
  } from "@dfds-ui/react-components";
import { useMachine } from '@xstate/react';
import  countMachine  from './CounterMachine';



export default function Counter() {
    const [state, send] = useMachine(countMachine);

  return (
    <>
      <Button onClick={() => send({ type: 'increment' })}>Increment</Button>
      <span>{state.context.count}</span>
      <Button onClick={() => send({ type: 'decrement', value: 2 })}>Decrement</Button>
    </>
  );
}