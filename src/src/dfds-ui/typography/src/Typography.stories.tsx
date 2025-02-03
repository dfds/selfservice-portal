import React from 'react'
import { storiesOf } from '@storybook/react'

import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'
import Text from './Text'

const stories = storiesOf('Hydro Theme/Typography', module)

stories.add('General', () => {
  return (
    <StoryPage>
      {Md`
# Typography
This section provides a set of tools to apply text styles from [Zeplin](https://zpl.io/bzjppqG).

There are two ways to consume the styles in this package - using \`Text\` component and by importing the styles.

## Text

~~~jsx
import { Text } from '@/dfds-ui/typography/src'
~~~

\`Text\` accepts the two following props:
### as (default value: "p")
"as" prop accepts a name of an html tag and it dictates the output wrapping tag of the component i.e. if you wish to have a <span> as an output:


~~~jsx
<Text as="span">Some text</Text>
~~~
will yield:
~~~html
<span>Some Text</span>
~~~

* styledAs (default value: "body")
The accepted values are as follows:

- heroHeadline
- sectionHeadline
- subHeadline
- smallHeadline
- body
- bodyBold
- bodyInterface
- bodyInterfaceBold
- bodyInterfaceSmall
- bodyInterfaceSmallBold
- label
- labelSmall
- action
- actioBold
- caption

For example, in order to output hero headline:

~~~jsx
<Text as="h1" styledAs="heroHeadline">Hero Headline</Text>
~~~~`}
      <ExampleContainer headline="Hero Headline">
        <Text styledAs={'heroHeadline'}>Hero Headline | DFDS Light</Text>
      </ExampleContainer>
      {Md`
## Styles

\`styles\` can be used in cases where the style needs to be incorporated into existing css.

For example, in order to output css for hero headline into css, the following can be done:

~~~jsx
import { styles } from '@/dfds-ui/typography/src'

const SomeComponent = styled.div\`
    \${styles.heroHeadline};
    background: red;
\`
~~~

will yeild the following associated css:

~~~css
.some-class {
  font-family: DFDS,Verdana,system-ui,Arial,"Helvetica Neue",Helvetica,sans-serif;
  font-weight: 300;
  font-size: 48px;
  line-height: 1.167;
}
~~~
`}
    </StoryPage>
  )
})

stories.add('Headline', () => {
  return (
    <StoryPage>
      {Md`
## Headline

~~~jsx
import { Text } from '@/dfds-ui/typography/src'

<Text styledAs={'heroHeadline'}>Hero Headline | DFDS Light</Text>
~~~
`}
      <ExampleContainer headline="Hero Headline">
        <Text styledAs={'heroHeadline'}>Hero Headline | DFDS Light</Text>
      </ExampleContainer>
      {Md`
~~~jsx

<Text styledAs={'sectionHeadline'}>Section headline / DFDS</Text
~~~`}
      <ExampleContainer headline="Section headline">
        <Text styledAs={'sectionHeadline'}>Section headline / DFDS</Text>
      </ExampleContainer>
      {Md`
~~~jsx

<Text styledAs={'subHeadline'}>Sub headline / DFDS Light</Text>
~~~`}
      <ExampleContainer headline="Sub headline">
        <Text styledAs={'subHeadline'}>Sub headline / DFDS Light</Text>
      </ExampleContainer>
      {Md`
~~~jsx

<Text styledAs={'smallHeadline'}>Small headline / DFDS</Text>
~~~`}
      <ExampleContainer headline="Small headline">
        <Text styledAs={'smallHeadline'}>Small headline / DFDS</Text>
      </ExampleContainer>
    </StoryPage>
  )
})

stories.add('Body', () => {
  return (
    <StoryPage>
      {Md`
## Body

~~~jsx
import { Text } from '@/dfds-ui/typography/src'

<Text styledAs={'body'}>Body Paragraph | Verdana</Text>

~~~`}
      <ExampleContainer headline="Body">
        <Text styledAs={'body'}>Body Paragraph | Verdana</Text>
      </ExampleContainer>
      {Md`
~~~jsx

<Text styledAs={'bodyBold'}>Body Paragraph Bold | Verdana</Text>
~~~`}
      <ExampleContainer headline="Body Bold">
        <Text styledAs={'bodyBold'}>Body Paragraph Bold | Verdana</Text>
      </ExampleContainer>
      {Md`
~~~jsx

<Text styledAs={'bodyInterface'}>Body Interface / Verdana</Text>
~~~`}
      <ExampleContainer headline="Body Interface">
        <Text styledAs={'bodyInterface'}>Body Interface / Verdana</Text>
      </ExampleContainer>
      {Md`
~~~jsx

<Text styledAs={'bodyInterfaceBold'}>Body Interface Bold / Verdana</Text>
~~~`}
      <ExampleContainer headline="Body Interface Bold">
        <Text styledAs={'bodyInterfaceBold'}>Body Interface Bold / Verdana</Text>
      </ExampleContainer>
      {Md`
~~~jsx

<Text styledAs={'bodyInterfaceSmall'}>Body Interface Small / Verdana</Text>
~~~`}
      <ExampleContainer headline="Interface Small">
        <Text styledAs={'bodyInterfaceSmall'}>Body Interface Small / Verdana</Text>
      </ExampleContainer>
      {Md`
~~~jsx

<Text styledAs={'bodyInterfaceSmallBold'}>Body Interface Small / Verdana</Text>
~~~`}
      <ExampleContainer headline="Interface Small Bold">
        <Text styledAs={'bodyInterfaceSmallBold'}>Body Interface Small Bold / Verdana</Text>
      </ExampleContainer>
    </StoryPage>
  )
})

stories.add('Label', () => {
  return (
    <StoryPage>
      {Md`
## Label
~~~jsx

import { Text } from '@/dfds-ui/typography/src'

<Text styledAs={'label'}>Label / DFDS</Text>
~~~`}
      <ExampleContainer headline="Medium">
        <Text styledAs={'label'}>Label / DFDS</Text>
      </ExampleContainer>
      {Md`
~~~jsx

<Text styledAs={'labelSmall'}>Label / DFDS</Text>
~~~`}
      <ExampleContainer headline="Small">
        <Text styledAs={'labelSmall'}>Label / DFDS</Text>
      </ExampleContainer>
    </StoryPage>
  )
})

stories.add('Action', () => {
  return (
    <StoryPage>
      {Md`
## Action
~~~jsx

import { Text } from '@/dfds-ui/typography/src'

<Text styledAs={'action'}>Label / DFDS</Text>
~~~`}
      <ExampleContainer headline="Regular">
        <Text styledAs={'action'}>Action / DFDS</Text>
      </ExampleContainer>
      {Md`
~~~jsx

<Text styledAs={'actionBold'}>Label / DFDS</Text>
~~~`}
      <ExampleContainer headline="Bold">
        <Text styledAs={'actionBold'}>Action Bold / DFDS</Text>
      </ExampleContainer>
    </StoryPage>
  )
})

stories.add('Caption', () => {
  return (
    <StoryPage>
      {Md`
## Caption
~~~jsx

import { Text } from '@/dfds-ui/typography/src'

<Text styledAs={'caption'}>Caption / Verdana</Text>
~~~`}
      <ExampleContainer headline="Regular">
        <Text styledAs={'caption'}>Caption / Verdana</Text>
      </ExampleContainer>
    </StoryPage>
  )
})
