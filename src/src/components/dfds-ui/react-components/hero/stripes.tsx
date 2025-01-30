import React from 'react'
import { theme } from '@dfds-ui/theme'

type Props = {
  color?: string
}

const Stripes: React.FC<Props> = (props: Props) => {
  const stopColor = props.color ? props.color : theme.colors.primary.main
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300">
      <defs>
        <linearGradient id="a" x1="34.045%" x2="60.664%" y1="27.872%" y2="57.624%">
          <stop offset="0%" stopColor={stopColor}></stop>
          <stop offset="100%" stopColor={stopColor} stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient id="b" x1="100%" x2="24.236%" y1="50%" y2="50%">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0.5"></stop>
          <stop offset="100%" stopColor="#FFF" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient id="c" x1="100%" x2="0%" y1="50%" y2="50%">
          <stop offset="0%" stopColor="#FFF"></stop>
          <stop offset="100%" stopColor="#FFF" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient id="d" x1="100%" x2="0%" y1="50.002%" y2="50.002%">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0.3"></stop>
          <stop offset="100%" stopColor="#FFF" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient id="e" x1="0%" x2="32.615%" y1="50%" y2="50%">
          <stop offset="0%" stopColor={stopColor}></stop>
          <stop offset="100%" stopColor={stopColor} stopOpacity="0.4"></stop>
        </linearGradient>
        <linearGradient id="f" x1="56.707%" x2="74.064%" y1="50%" y2="0%">
          <stop offset="0%" stopColor="#FFF"></stop>
          <stop offset="100%" stopColor="#FFF" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient id="g" x1="100%" x2="24.236%" y1="50%" y2="50%">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0.5"></stop>
          <stop offset="100%" stopColor="#FFF" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient id="h" x1="34.058%" x2="54.049%" y1="98.329%" y2="0%">
          <stop offset="0%" stopColor={stopColor}></stop>
          <stop offset="100%" stopColor={stopColor} stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient id="i" x1="29.102%" x2="53.879%" y1="94.85%" y2="11.912%">
          <stop offset="0%" stopColor={stopColor}></stop>
          <stop offset="100%" stopColor={stopColor} stopOpacity="0"></stop>
        </linearGradient>
      </defs>
      <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1">
        <g>
          <path fill="url(#a)" d="M187 0L17.5623569 300 5.02504288e-13 300 3.0494357e-13 0z"></path>
          <path fill="url(#b)" d="M225 0L56 300 9.09494702e-13 300 1.10134124e-13 260.381378 147 0z"></path>
          <path fill="url(#c)" d="M251.606351 0L83 300 8 300 176.606351 0z" opacity="0.1"></path>
          <path fill="url(#d)" d="M197.071475 0L28 300 17.5623569 300 187.071475 0z"></path>
          <path fill="url(#e)" d="M1.56235689 300L171 0 -2.08832951e-13 0 -2.08832951e-13 300z"></path>
        </g>
        <g transform="rotate(180 300 150)">
          <path fill="url(#f)" d="M75.6063512 0L-2.86454823e-13 134.437093 -7.44558531e-13 0z" opacity="0.227"></path>
          <path fill="url(#g)" d="M69 0L7.10542736e-14 122.854849 -5.67508497e-13 0z"></path>
          <path fill="url(#h)" d="M-1.34467524e-13 118.657038L67 2.60208521e-16 4.26325641e-14 0z"></path>
          <path fill="url(#i)" d="M47 0L3.84619474e-13 83.119437 -2.4158453e-13 0z"></path>
        </g>
      </g>
    </svg>
  )
}

export default Stripes
