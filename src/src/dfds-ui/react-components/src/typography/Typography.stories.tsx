import React from 'react'
import { storiesOf } from '@storybook/react'

import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'
import { H1, H2, H3, H4, Headline } from './Headlines'

const stories = storiesOf('Legacy/Typography', module)

stories.add('Headlines (preview)', () => {
  return (
    <StoryPage>
      {Md`
# Headlines
Currently the headlines have a \`margin-bottom\` set to \`15px\`. This might change in the future.
      `}
      <ExampleContainer headline="Headline examples">
        <H1>Hero Headline</H1>
        <H2>Section Headline</H2>
        <H3>Sub Headline</H3>
        <H4>Small Headline</H4>
        {Md`
~~~jsx
import { H1, H2, H3, H4 } from '@/dfds-ui/react-components/src';

<H1>Hero Headline</H1>
<H2>Section Headline</H2>
<H3>Sub Headline</H3>
<H4>Small Headline</H4>
~~~
`}
      </ExampleContainer>
      {Md`
## Aliases
The following aliases are defined for the different headlines.

\`H1\` → \`HeroHeadline\`

\`H2\` → \`SectionHeadline\`

\`H3\` → \`SubHeadline\`

\`H4\` → \`SmallHeadline\`

## Rendering as different HTML element
All the headlines supports a polymorphic prop \`as\` so they can be rendered using a different HTML element or custom component but keep the styling.
`}
      <ExampleContainer headline="Example using the as prop">
        <H1 as="h2">H1 styles rendered as h2</H1>
        <H2 as="h1">H2 styles rendered as h1</H2>
        {Md`
~~~jsx
import { H1, H2 } from '@/dfds-ui/react-components/src';

<H1 as="h3">H1 rendered as h2 tag</H1>
<H2 as="h1">H2 rendered as h1 tag</H2>
~~~
`}
      </ExampleContainer>
      {Md`
## Headline component
The \`Headline\` component is an alternative with both an \`as\` and a \`styledAs\` prop to control what is rendered.
`}
      <ExampleContainer headline="Example using the Headline component">
        <Headline>h1 tag with h1 styles</Headline>
        <Headline as="h2">h2 tag with h2 styles</Headline>
        <Headline as="h1" styledAs="h3">
          h1 tag with h3 styles
        </Headline>
        <Headline as="span" styledAs="h4">
          span tag with h4 styles
        </Headline>
        {Md`
~~~jsx
import { Headline } from '@/dfds-ui/react-components/src';

<Headline>h1 tag with h1 styles</Headline>
<Headline as="h2">h2 tag with h2 styles</Headline>
<Headline as="h1" styledAs="h3">h1 tag with h3 styles</Headline>
<Headline as="span" styledAs="h4">span tag with h4 styles</Headline>
~~~
`}
      </ExampleContainer>
      {Md`
## Remove margin
All the headline components support a \`noMargin\` props which if set to true will remove the margin from the headline.
`}
      <ExampleContainer headline="Example using noMargin">
        <Headline noMargin>Headline with no margin</Headline>
        <H2 noMargin>Another headline with no margin</H2>
        {Md`
~~~jsx
import { Headline, H2 } from '@/dfds-ui/react-components/src';

<Headline noMargin>Headline with no margin</Headline>
<H2 noMargin>Another headline with no margin</H2>
~~~
`}
      </ExampleContainer>
    </StoryPage>
  )
})
