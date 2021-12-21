import React, { CSSProperties, ReactNode, ReactElement } from 'react'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
  common: {
    padding: 12,
    display: 'inline-block',
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'iA Writer Quattro V',
    fontSize: 14,
    fontWeight: 500,
  },
  light: {
    backgroundColor: '#f9f9f9',
    color: '#303030',
    '&:hover': {
      backgroundColor: '#fdfdfd',
    },
  },
  dark: {
    backgroundColor: '#3f3f3f',
    color: '#f9f9f9',
    '&:hover': {
      backgroundColor: '#595959',
    },
  },
})

interface Props {
  id?: string
  children?: ReactNode
  style?: CSSProperties
  variant: 'dark' | 'light'
  onClick?: () => void
  href?: string
  target?: '_blank'
}

const Button = ({ children, style, variant, href, target, onClick, id }: Props): ReactElement => {
  const classes = useStyles()

  if (onClick) {
    return (
      <div
        id={id}
        className={`${classes.common} ${variant === 'dark' ? classes.dark : classes.light}`}
        style={style}
        onClick={onClick}
      >
        {children}
      </div>
    )
  }

  return (
    <a
      id={id}
      className={`${classes.common} ${variant === 'dark' ? classes.dark : classes.light}`}
      style={style}
      href={href}
      target={target}
    >
      {children}
    </a>
  )
}

export default Button
