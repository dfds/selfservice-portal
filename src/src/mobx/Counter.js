import React from "react";
import {
    Button
  } from "@dfds-ui/react-components";

import { observer } from "mobx-react-lite"

import { store} from "./store"



const Counter = observer(() => {

    return ( 
        <div>
          <Button onClick={() => store.increment()}>Increment</Button>
          <span>{store.count}</span>
          <Button onClick={() => store.decrement()}>Decrement</Button>
        </div>
      );
    

}) ;

export default Counter;

  