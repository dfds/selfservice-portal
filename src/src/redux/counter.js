import React from "react";
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from './CounterSlice'
import {
    Button
  } from "@dfds-ui/react-components";



export default function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <>
      <Button onClick={() => dispatch(increment())}>Increment</Button>
      <span>{count}</span>
      <Button onClick={() => dispatch(decrement())}>Decrement</Button>
    </>
  );
}
