import React, { ReactNode } from 'react'
import {
  Canvas as SbCanvas,
  Meta as SbMeta,
  ArgsTable as SbArgsTable,
  DocsContainer as SbDocsContainer,
  Story as SbStory,
  Description as SbDescription,
  Source as SbSource,
} from '@storybook/addon-docs'

import { hrefTo } from '@storybook/addon-links'
import { css, Global } from '@emotion/react'
import { ExternalLink, ArrowBack, StatusWarning, Download } from '@/dfds-ui/icons/src/system'

const overflowVisibleInPreview = css`
  overflow: visible;
  & > div > div:first-of-type {
    overflow: visible;
  }
`

export type PreviewProps = {
  children: React.ReactNode
  gray?: boolean
  height?: string
  width?: string
  className?: string
  mdxSource?: string
  sourcePath?: string
}

function componentTags(component: any) {
  if (component && component?.__docgenInfo?.tags) {
    return component.__docgenInfo.tags
  }
  return {}
}

function findDeprecatedTag(component: any) {
  const tags = componentTags(component)
  if ('deprecated' in tags) {
    return tags['deprecated'] || true
  }
  return null
}

export const Canvas = ({ gray = false, height, width, ...rest }: PreviewProps) => {
  return (
    <SbCanvas
      css={css`
        border: 20px solid #eee;
        border-radius: 12px;
        box-shadow: none;
        /* Preview div */
        & > div:first-of-type {
          height: ${height && height};
          & > div:first-of-type {
            height: 100%;
            background-color: ${gray && '#fcfcfd'};
            ${width &&
            css`
              max-width: ${width};
              /* TODO: Figure out why this was needed */
              /* box-sizing: ${width && 'content-box'}; */
            `}
            position: static;
            & > div:first-of-type {
              /* this ensures that elements in the story will be display on top of the "show code" button */
              z-index: 2;
            }
          }
        }
        /* Source code div */
        & > div:nth-of-type(2) {
          border-radius: 0;
          box-shadow: none;
        }
        ${overflowVisibleInPreview}
      `}
      {...rest}
    />
  )
}

/** @deprecated use Canvas */
export const Preview = Canvas

export const Source = (props: any) => {
  return <SbSource {...props} />
}

const docBlockOverrides = css`
  /* stylelint-disable */
  .sbdocs-h1 {
    font-family: DFDS !important;
    color: #002b45 !important;
    font-size: 56px !important;
    font-weight: bold !important;
  }

  .sbdocs-h2 {
    font-family: DFDS !important;
    color: #002b45 !important;
    font-size: 32px !important;
    border: 0 !important;
    font-weight: bold !important;
  }

  .sbdocs-h3 {
    font-family: DFDS !important;
    color: #002b45 !important;
    font-size: 24px !important;
    border: 0 !important;
    font-weight: bold !important;
  }

  .sbdocs-h4 {
    font-family: DFDS !important;
    color: #002b45 !important;
    font-size: 20px !important;
    border: 0 !important;
    font-weight: bold !important;
  }

  .docblock-argstable-body,
  .docblock-source {
    border-radius: 0 !important;
    background-color: #ffffff !important;
    box-shadow: none !important;
  }

  .docblock-argstable,
  .docblock-propstable {
    margin: 16px 0 !important;
    th {
      border: 1px solid #deeaf7 !important;
      border-left-width: 0 !important;
      border-right-width: 0 !important;
      border-top-width: 0 !important;
      border-radius: 0 !important;
      background: #f6f9fc;
      font-weight: normal;
      color: #3c3c3c !important;
      padding: 6px 12px !important;
    }

    tr {
      background-color: #fff !important;

      &:last-of-type td {
        border-bottom-width: 0 !important;
      }
    }
    /* tr:nth-of-type(even) {
      background-color: #fdfdfd !important;
    } */
    tbody {
      box-shadow: none !important;
    }
    td {
      background-color: transparent !important;
      padding: 14px 12px !important;
      border: 1px solid #deeaf7 !important;
      border-left-width: 0 !important;
      border-right-width: 0 !important;
      /* border-top: 1px solid rgba(0, 0, 0, 0.1) !important; */
      &:first-of-type {
        min-width: 165px;
        span:first-of-type {
          font-family: monospace;
          font-weight: normal;
          display: inline-block;
          /*
          border: 1px solid #eee;
          padding: 0 5px;
          background-color: #f8f8f8;
          font-size: 12px;
          margin: 2px 0; */
        }
      }
      &:nth-of-type(2) {
        width: 80%;
        & div:last-of-type {
          span {
            color: #932981; /*#0000cc;*/
            font-size: 12px;
          }
        }
      }

      &:nth-of-type(3) {
        span:first-of-type {
          font-size: 12px;
        }
      }

      [title='Required'] {
        visibility: hidden;
        &::after {
          font-family: monospace;
          visibility: visible;
          content: 'required';
          font-size: 10px;
          display: block;
        }
      }
    }
  }
  /* stylelint-enable */
`

const GlobalStorybookStyles = () => {
  const styles = css`
    html,
    body {
      font-size: 16px;
      background-color: #fcfcfd;
    }
    ${docBlockOverrides}
    .tabbutton {
      && {
        font-family: 'Nunito Sans', -apple-system, '.SFNSText-Regular', 'San Francisco', BlinkMacSystemFont, 'Segoe UI',
          'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 14px;
      }
    }
    .markdown-table {
      border: 1px solid #b0afaf;
      font-size: 14px;

      thead {
        text-align: left;
        font-weight: bold;
      }

      tr:nth-of-type(even) {
        background-color: #f8f8f8;
      }

      td,
      th {
        border: 1px solid #b0afaf;
        padding: 10px;
        code {
          /* stylelint-disable */
          padding: 10px !important;
          /* stylelint-enable */
        }
      }
    }
    .args-table-prop-name {
      font-family: monospace;
      font-size: 14px;
    }

    .args-table-badge {
      font-family: monospace;
      display: inline-block;
      background-color: #e7e7e7;
      padding: 2px 4px;
      color: #444444;
      font-size: 12px;
      line-height: 1;
      margin: 4px 6px 4px 0;
      border: 1px solid #00000008;
      border-radius: 4px;
    }

    .args-table-badge-required {
      background-color: #ebf7eb;
    }

    .args-table-badge-deprecated {
      background-color: #f1dcdc;
    }
  `
  return <Global styles={styles} />
}

function isInLabSection(title: string) {
  return title?.toLowerCase().startsWith('lab')
}

export const LabWarningBanner = () => {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        padding: 1rem 1rem 1rem 1rem;
        background-color: #ffffff;
        position: relative;
        border: 2px solid #ff992c;
        margin-bottom: 16px;
      `}
    >
      <StatusWarning
        css={css`
          color: #ff992c;
          margin-right: 16px;
          font-size: 32px;
          min-width: 32px;
          align-self: flex-start;
        `}
      />
      <div>
        This component belongs to the <strong>Lab</strong> section and is "work in progress". Expect breaking changes if
        you consume it in your application.
      </div>
    </div>
  )
}

export const DeprecatedBanner = ({ headline, children }: { headline: string; children: ReactNode }) => {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        padding: 1rem 1rem 1rem 1rem;
        background-color: #570000;
        position: relative;
        margin-bottom: 16px;
        color: white;

        & h1 {
          font-size: 1.25rem;
          margin: 0 0 0.25rem 0;
          padding: 0;
        }

        & p {
          color: white;
          margin: 0 0 0.25rem 0;
        }

        & a {
          color: white;
          text-decoration: underline;
        }
      `}
    >
      <span
        css={css`
          margin-right: 16px;
          font-size: 32px;
          min-width: 32px;
          align-self: flex-start;
        `}
      >
        🚧
      </span>
      <div>
        <h1>{headline}</h1>
        {children}
      </div>
    </div>
  )
}

export const Meta = ({ title, ...rest }: any) => {
  return (
    <>
      <GlobalStorybookStyles />
      {isInLabSection(title) && <LabWarningBanner />}
      <SbMeta title={title} {...rest} />
    </>
  )
}

function isInFrame() {
  return window && window.self !== window.top
}

const ShowDocsFullScreen = () => {
  return (
    <a
      href="#"
      title="Show Docs in full screen"
      css={css`
        opacity: ${isInFrame() ? 1 : 0};
        display: flex;
        align-items: center;
        text-decoration: none;
        padding: 2px;
        display: flex;
        color: #999;
        font-size: 24px;
        &:hover {
          color: #666;
        }
      `}
    >
      <ExternalLink />
    </a>
  )
}

function parseQuery(queryString: string) {
  const query: Record<string, string> = {}
  const pairs = (queryString.startsWith('?') ? queryString.substr(1) : queryString).split('&')
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=')
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  }
  return query
}

const BackToStorybook = () => {
  return (
    <a
      href={window.location.origin + '?path=/docs/' + parseQuery(window.location.search)['id']}
      title="Back to Storybook"
      css={css`
        display: ${isInFrame() ? 'none' : 'flex'};
        align-items: center;
        text-decoration: none;
        padding: 2px;
        color: #999;
        font-size: 24px;
        &:hover {
          color: #666;
        }
      `}
    >
      <ArrowBack />
    </a>
  )
}

export const DocsContainer = ({ children, ...rest }: any) => {
  return (
    <>
      <div
        css={css`
          position: absolute;
          display: flex;
          top: 8px;
          right: 8px;
        `}
      >
        <ShowDocsFullScreen />
        <BackToStorybook />
      </div>
      <SbDocsContainer {...rest}>{children}</SbDocsContainer>
    </>
  )
}

type ComponentMap = Record<string, Record<string, string>>

const applyArgsTableDesign = (cur: string, map: ComponentMap) => {
  try {
    const docTables = document.querySelectorAll('.docblock-argstable-body')
    docTables.forEach((table) => {
      const propNameTds = table.querySelectorAll('td:first-of-type')
      propNameTds.forEach((td) => {
        // Handle prop name
        const nameSpan = td.querySelectorAll('span')[0]

        if (!nameSpan) return // bail (can happen when design already applied (HMR))
        const propName = nameSpan.innerText
        nameSpan.remove()
        td.insertAdjacentHTML('beforeend', '<div class="args-table-prop-name">' + propName + '</div>')

        // Handle  required span
        const requiredSpan = td.querySelector('[title="Required"]')
        const isRequired = !!requiredSpan
        requiredSpan && requiredSpan.remove()
        isRequired &&
          td.insertAdjacentHTML('beforeend', '<div class="args-table-badge args-table-badge-required">required</div>')

        // Handle deprecated
        if (cur in map) {
          const dep = map[cur]
          if (propName in dep) {
            td.insertAdjacentHTML(
              'beforeend',
              '<div title="' + dep[propName] + '" class="args-table-badge args-table-badge-deprecated">deprecated</div>'
            )
          }
        }
      })
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Could not apply ArgsTable runtime design', e)
  }
}

export const ArgsTable = (props: any) => {
  const ofProp = props?.of?.__docgenInfo
  const componentsProp = props?.components

  const initialComponent = ofProp ? ofProp.displayName : componentsProp ? Object.keys(componentsProp)[0] : ''
  const [currentComponent, setCurrentComponent] = React.useState<string>(initialComponent)

  React.useLayoutEffect(() => {
    const result: Record<string, Record<string, string>> = {}

    if (ofProp) {
      const c = ofProp.displayName
      const componentProps = ofProp.props || {}
      result[c] = {}
      for (const prop of Object.keys(componentProps)) {
        if (componentProps[prop].tags && 'deprecated' in componentProps[prop].tags) {
          result[c][prop] = componentProps[prop].tags['deprecated']
        }
      }
    }

    if (componentsProp) {
      for (const name of Object.keys(componentsProp)) {
        result[name] = {}
        const componentProps = componentsProp[name]?.__docgenInfo?.props || {}
        for (const prop of Object.keys(componentProps)) {
          if (componentProps[prop].tags && 'deprecated' in componentProps[prop].tags) {
            result[name][prop] = componentProps[prop].tags['deprecated']
          }
        }
      }
    }
    applyArgsTableDesign(currentComponent, result)
  }, [componentsProp, currentComponent, ofProp])

  const handleTabButtonClient = (e: any) => {
    try {
      if (e.target.className.includes('tabbutton')) {
        setCurrentComponent(e.target.innerText)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Could not apply ArgsTable runtime design while clicking on tabbutton', e)
    }
  }

  React.useLayoutEffect(() => {
    document.addEventListener('click', handleTabButtonClient)
    return () => document.removeEventListener('click', handleTabButtonClient)
  }, [])

  return (
    <>
      <GlobalStorybookStyles />
      <div
        css={css`
          overflow: auto;
        `}
      >
        <SbArgsTable {...props} />
      </div>
    </>
  )
}

/** @deprecated use ArgsTable */
export const Props = ArgsTable

export const Story = (props: any) => {
  return <SbStory {...props} />
}

export const Description = (props: any) => {
  const depTag = props.of ? findDeprecatedTag(props.of) : null
  return (
    <>
      {depTag && <div className="args-table-badge args-table-badge-deprecated">DEPRECATED</div>}
      <SbDescription {...props} />
    </>
  )
}

type StoryLinkProps = {
  kind: string
  name: string
  mode?: 'docs' | 'canvas'
  target?: '_self' | '_blank'
  children?: React.ReactNode
}

export const StoryLink = ({ kind, name, mode = 'docs', target = '_self', children }: StoryLinkProps) => {
  const [link, setLink] = React.useState()

  React.useEffect(() => {
    const handle = (l: any) => {
      //remove existing viewMode
      l = l.replace(/&viewMode=(docs|canvas)/, '')
      l += `&viewMode=${mode}`
      setLink(l)
    }
    void hrefTo(kind, name).then((l) => {
      handle(l)
    })
  }, [kind, mode, name])

  return link ? (
    <a href={link} target={target}>
      {children}
    </a>
  ) : null
}

export const DownloadButton = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode
  href: string
  className?: string
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      css={css`
        margin: 0;
        align-items: center;
        position: relative;
        height: 2.75rem;
        border-radius: 2px;
        box-sizing: border-box;
        text-decoration: none;
        text-align: center;
        user-select: none;
        vertical-align: middle;
        overflow: visible;
        border: none;
        font-family: DFDS, Verdana, system-ui, Arial, 'Helvetica Neue', Helvetica, sans-serif;
        font-size: 16px;
        font-weight: 700;
        line-height: 1;
        max-width: 100%;
        min-width: 4rem;
        white-space: nowrap;
        transition: background-color 120ms ease, color 120ms ease;
        padding: 0 1rem 0 0.75rem;
        cursor: pointer;
        display: inline-flex;
        color: #ffffff;
        background: #1ea7fd;
        margin-bottom: 1rem;
      `}
    >
      <span
        css={css`
          text-size-adjust: 100%;
          text-transform: none;
          text-align: center;
          user-select: none;
          white-space: nowrap;
          cursor: pointer;
          background-repeat: no-repeat;
          box-sizing: inherit;
          display: flex;
          margin-right: 0.5rem;
          position: relative;
          order: 0;
          color: inherit;
          font-family: DFDS, Verdana, system-ui, Arial, 'Helvetica Neue', Helvetica, sans-serif;
          font-weight: 300;
          font-size: 24px;
          line-height: 1.334;
        `}
      >
        <Download />
      </span>
      {children}
    </a>
  )
}
