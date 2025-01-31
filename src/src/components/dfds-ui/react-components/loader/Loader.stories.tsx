import React from 'react'
import { storiesOf } from '@storybook/react'
import Loader from './Loader'
import DfdsLoader from './DfdsLoader'

const stories = storiesOf('Hydro UI/Loading Indicators/Loader', module)

const StandardLoader = ({ label }: { label?: string }) => {
  return <Loader label={label} />
}

stories.add('Loader', () => (
  <>
    <StandardLoader />
  </>
))

stories.add('Loader with label', () => (
  <>
    <StandardLoader label={'Please wait a moment while we load the page'} />
  </>
))

stories.add('DFDS Ship loader', () => (
  <>
    <DfdsLoader />
  </>
))

stories.add('DFDS Ship loader with label', () => (
  <>
    <DfdsLoader label="Loading content" />
  </>
))

stories.add('DFDS Ship loader where menu is visible', () => (
  <>
    <DfdsLoader showMenu={true} />
  </>
))

stories.add('DFDS Ship loader with label and where menu is visible', () => (
  <>
    <DfdsLoader showMenu={true} label="Loading content" />
  </>
))

stories.add('DFDS Ship loader change color', () => (
  <>
    <DfdsLoader iconColor="red" waveColor="blue" />
  </>
))
