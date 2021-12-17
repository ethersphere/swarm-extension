import React, { HTMLAttributes, ReactNode } from 'react'
import classes from './Button.css'

interface Props {
  children?: ReactNode
  style?: HTMLAttributes<HTMLDivElement>
}

const Button = ({ children, style }: Props) => (
  <div className="Button" style={style}>
    {children}
  </div>
)

export default Button
