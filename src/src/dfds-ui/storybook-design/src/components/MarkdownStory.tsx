import React from 'react'
import { StoryPage, ExampleContainer } from './'
import { Markdown } from '../markdown'

type MarkdownStoryProps = {
  file: string
  content: Promise<{ default: string }>
}

const MarkdownStory = ({ file, content }: MarkdownStoryProps) => {
  const [loading, setLoading] = React.useState<boolean>(true)
  const [markdown, setMarkdown] = React.useState<string>('')

  React.useEffect(() => {
    void content.then((c) => {
      setMarkdown(c.default)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <StoryPage>
      <ExampleContainer headline={file}>
        <Markdown>{loading ? `loading...` : markdown}</Markdown>
      </ExampleContainer>
    </StoryPage>
  )
}

export default MarkdownStory
