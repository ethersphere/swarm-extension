import React, { HTMLAttributes, ReactNode } from 'react'
import { createUseStyles } from 'react-jss'

interface Props {
  id?: string
  children?: ReactNode
  style?: HTMLAttributes<HTMLDivElement>
  onToggle: (value: boolean) => void
  checked: boolean
}

const useStyles = createUseStyles({
  root: { width: 70, textAlign: 'right', fontFamily: 'iA Writer Mono V' },
  toggle: {
    ['-webkit-appearance']: 'none',
    ['-moz-appearance']: 'none',
    appearance: 'none',
    width: 32,
    height: 18,
    margin: 0,
    padding: 0,
    display: 'inline-block',
    position: 'relative',
    borderRadius: 25,
    overflow: 'hidden',
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#707070',
    transition: 'background-color ease 0.3s',
    transform: 'translate(0, 30%)',

    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      zIndex: 2,
      width: 14,
      height: 14,
      background: '#fff',
      left: 2,
      top: 2,
      borderRadius: '50%',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      textIndent: -11,
      wordSpacing: 19,
      color: '#fff',
      textShadow: '-1px -1px rgba(0, 0, 0, 0.15)',
      whiteSpace: 'nowrap',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
      transition: 'all cubic-bezier(0.3, 1.5, 0.7, 1) 0.3s',
    },
    '&:checked': {
      backgroundColor: '#52d368',
      '&:before': {
        left: 16,
      },
    },
  },
})

const Toggle = ({ style, onToggle, checked, id }: Props) => {
  const classes = useStyles()

  return (
    <div className={classes.root} id={id}>
      {checked ? 'on' : 'off'}{' '}
      <input
        className={classes.toggle}
        style={style}
        onClick={() => onToggle(!checked)}
        type="checkbox"
        checked={checked}
      />
    </div>
  )
}

export default Toggle
