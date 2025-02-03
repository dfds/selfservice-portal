import { useEffect, useState } from 'react'
const getOnLineStatus = () =>
  typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true
const useOffline = () => {
  const [status, setStatus] = useState(getOnLineStatus())
  const setOnline = () => setStatus(true)
  const setOffline = () => setStatus(false)
  useEffect(() => {
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOffline)
    return () => {
      window.removeEventListener('online', setOnline)
      window.removeEventListener('offline', setOffline)
    }
  }, [])
  return { isOnline: status, isOffline: !status }
}
export default useOffline
