/* eslint-disable @typescript-eslint/ban-types */
import React, { FunctionComponent, useReducer } from 'react'
import { css } from '@emotion/react'
import { Checkbox } from '../forms/checkbox'
import { theme } from '@/components/dfds-ui/theme'

export type DataTableProps = {
  onChange?: (model: object[]) => object[]
  columns?: string[]
  data: object[]
  className?: string
  hasHeader?: boolean
}

const tableStyle = () => css`
  text-align: left;
  border-collapse: collapse;
  width: 100%;
  border: none;
  color: ${theme.colors.text.dark.primary};
  font-size: 12px;
  tr {
    border-top: 1px solid ${theme.colors.text.dark.disabled};
    border-bottom: 1px solid ${theme.colors.text.dark.disabled};
  }
  th,
  td {
    padding: 16px;
    label {
      color: ${theme.colors.primary.main};
      font-weight: bold;
    }
  }
`

const TOGGLE = 'toggle'

function reducer(model: any, action: any): object[] {
  const newModel = [...model]
  switch (action.type) {
    case TOGGLE:
      newModel[action.key].field.value = !newModel[action.key].field.value
      return newModel
    default:
      return newModel
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DataTable: FunctionComponent<DataTableProps> = ({
  children,
  onChange,
  columns,
  data,
  hasHeader,
  ...rest
}) => {
  const [model, dispatch] = useReducer(reducer, data)
  const dataKeys = Object.keys(model[0])
  const displayColumns = columns ? columns : dataKeys

  React.useEffect(() => {
    if (onChange) {
      onChange(model)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model])

  return (
    <table css={tableStyle()} {...rest}>
      {hasHeader && (
        <thead>
          <tr>
            {displayColumns.map((key, i) => {
              return <th key={i}> {key} </th>
            })}
          </tr>
        </thead>
      )}
      <tbody>
        {data.map((valueObj: any, i) => {
          return (
            <tr key={i}>
              {dataKeys.map((key: any, y) => {
                if (key === 'field') {
                  const { name, value, label } = valueObj.field
                  return (
                    <td key={y}>
                      {
                        <Checkbox
                          name={name}
                          checked={value}
                          onChange={() => {
                            dispatch({ type: TOGGLE, key: i })
                          }}
                        >
                          {label}
                        </Checkbox>
                      }
                    </td>
                  )
                }
                return <td key={y}> {valueObj[key]} </td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default DataTable
