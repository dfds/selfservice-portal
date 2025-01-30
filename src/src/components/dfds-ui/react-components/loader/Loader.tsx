import React from 'react'
import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { Ship, Waves } from '@dfds-ui/icons'
import { theme } from '@dfds-ui/theme'

type Props = {
  label?: string
}

const sail = keyframes`
  to {
    transform: translateY(-3px);
  }
`

const wave = keyframes`
  to {
    transform: translateX(-30px);
  }
`

const ShipLoader = styled(Ship)`
  width: 80px;
  height: 80px;
  position: fixed;
  top: 50%;
  left: 50%;
  color: ${theme.colors.secondary.main};
  z-index: 5000;
  margin-top: -40px;
  margin-left: -40px;
  display: block;
  animation: ${sail} 0.58s ease-in-out alternate infinite;
`

const Label = styled.div`
  text-align: center;
  position: fixed;
  display: block;
  top: 55%;
  right: 0;
  left: 0;
  z-index: 5000;
  padding-top: 2rem;
  font-size: 17px;
`

const WavesLoader = styled(Waves)`
  top: 50%;
  left: 50%;
  width: 146px;
  height: 20px;
  color: ${theme.colors.surface.secondary};
  position: fixed;
  z-index: 5001;
  margin-left: -73px;
  margin-top: 13px;
  animation: ${wave} 0.8s linear infinite;
`

const Overlay = styled.div`
  background-color: ${theme.colors.surface.secondary};
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 4999;
`

function Loader(props: Props) {
  return (
    <Overlay>
      <div>
        <ShipLoader />
        <WavesLoader />
      </div>
      <Label>{props.label}</Label>
    </Overlay>
  )
}

export default Loader
