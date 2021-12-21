import React, { CSSProperties, ReactNode, ReactElement } from 'react'
import { createUseStyles } from 'react-jss'

interface Props {
  children?: ReactNode
  style?: CSSProperties
}

const useStyles = createUseStyles({
  root: { backgroundColor: '#f9f9f9', width: '100%', padding: 12 },
})

const Row = ({ children, style }: Props): ReactElement => {
  const classes = useStyles()

  return (
    <div className={classes.root} style={style}>
      {children}
    </div>
  )
}

export default Row
