import React, {
  useEffect,
  useReducer,
  useCallback,
  useRef,
  useContext,
  createContext,
  PropsWithChildren,
  FunctionComponent,
} from 'react'
import { Toast } from '.'
import styled from '@emotion/styled'
import { Fade } from '@mui/material'
import { ToastProps } from './Toast'

const Container = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 50px;
`
type TimeoutType = { timeout?: number }

type ToasterState = {
  open: boolean
  hasActive: boolean
  toastProps: ToastProps | null
} & TimeoutType

const ToasterContext = createContext<{
  state: ToasterState
  handleOnOpen: (props: PropsWithChildren<ToastProps & TimeoutType>) => Promise<void>
} | null>(null)

export const useToaster = () => {
  const context = useContext(ToasterContext)
  if (!context) {
    throw new Error('useToaster must be used inside of Toaster Provider component')
  }
  return { addToast: context.handleOnOpen, state: context.state }
}

const initialState = {
  open: false,
  hasActive: false,
  toastProps: null,
  timeout: 3000,
}

const toasterReducer = (state: ToasterState, action: any) => {
  switch (action.type) {
    case 'CLOSE':
      return initialState
    case 'OPEN':
      return {
        open: true,
        hasActive: true,
        toastProps: action.payload,
        timeout: action.payload.timeout || state.timeout,
      }
    default:
      return state
  }
}

const Toaster: FunctionComponent<{ children: React.ReactNode | React.ReactNode[]; globalTimeout?: number }> = ({
  children,
  globalTimeout,
}) => {
  const [{ open, hasActive, toastProps, timeout }, dispatch] = useReducer(toasterReducer, {
    ...initialState,
    timeout: globalTimeout || initialState.timeout,
  })
  const timerRef = useRef<number | null>(null)
  const handleTimeoutCleanUp = () => {
    timerRef.current && window.clearTimeout(timerRef.current)
    timerRef.current = null
  }
  const handleTimeout = useCallback(
    () => (timerRef.current = window.setTimeout(() => handleOnClose(), timeout)),
    [timeout]
  )

  function sleep() {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 300)
    })
  }

  const handleOnClose = () => {
    dispatch({ type: 'CLOSE' })
  }

  const handleOnOpen = async (payload: ToastProps) => {
    if (hasActive) {
      handleOnClose()
      await sleep()
    }
    dispatch({ type: 'OPEN', payload })
  }
  useEffect(() => {
    if (open) {
      handleTimeout()
    }
    return handleTimeoutCleanUp
  }, [handleTimeout, open])
  return (
    <>
      <ToasterContext.Provider value={{ handleOnOpen, state: { open, hasActive, toastProps, timeout } }}>
        {children}
      </ToasterContext.Provider>
      {open && (
        <Container onMouseEnter={handleTimeoutCleanUp} onMouseLeave={handleTimeout}>
          <Fade in={open} mountOnEnter unmountOnExit onExited={handleTimeoutCleanUp}>
            <div>
              <Toast
                {...toastProps}
                {...(toastProps?.onRequestClose
                  ? {
                      onRequestClose: () => {
                        handleOnClose()
                        toastProps.onRequestClose && toastProps.onRequestClose()
                      },
                    }
                  : {})}
              />
            </div>
          </Fade>
        </Container>
      )}
    </>
  )
}

export default Toaster
