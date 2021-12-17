import React, { HTMLAttributes, ReactNode } from 'react'

interface Props {
  children?: ReactNode
  style?: HTMLAttributes<HTMLDivElement>
}

const Row = ({ children, style }: Props) => (
  <div style={{ backgroundColor: '#f9f9f9', width: '100%', padding: 12, ...style }}>{children}</div>
)

export default Row
