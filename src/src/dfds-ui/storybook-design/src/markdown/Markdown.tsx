import React from 'react'
import ReactMarkdown from 'react-markdown'
import renderers from 'react-markdown-github-renderers'

// the ListItem renderer from react-markdown-github-renderers does not render checkboxes so we create our own
const ListItemRenderer = (props: any) => {
  let checkbox = null
  if (props.checked !== null) {
    const checked = props.checked
    checkbox = React.createElement('input', { type: 'checkbox', checked, readOnly: true, style: { margin: '4px' } })
  }

  return React.createElement(
    'li',
    {
      style: {
        marginTop: 4,
        lineHeight: 1.5,
      },
    },
    checkbox,
    props.children
  )
}

const TableRenderer = (props: any) => {
  return React.createElement(
    'table',
    {
      className: 'markdown-table',
    },
    props.children
  )
}

const customRenderers = { ...renderers, listItem: ListItemRenderer, table: TableRenderer }

const Markdown = ({ children, ...rest }: { source?: any; children: React.ReactNode }) => {
  return <ReactMarkdown escapeHtml={false} source={children as string} renderers={customRenderers} {...rest} />
}

export default Markdown
