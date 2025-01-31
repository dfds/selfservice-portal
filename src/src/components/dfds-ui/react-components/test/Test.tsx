import React, { FC } from 'react'

export interface TestProps {
  /** Test name. */
  name: string
  description?: string
}

export const Test: FC<TestProps> = (props) => {
  return <div>{props.name}</div>
}

export default Test
