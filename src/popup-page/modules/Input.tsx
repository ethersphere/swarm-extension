import React, { ReactElement } from 'react'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
  root: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  input: {
    backgroundColor: 'rgba(0,0,0,0)',
    border: 'none',
    textAlign: 'right',
    fontFamily: 'iA Writer Quattro V',
    fontSize: 14,
    fontWeight: 500,
    '&:focus': { outline: 'none' },
  },
})

interface Props {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
}

export default function Input({ label, value, onChange, id }: Props): ReactElement {
  const classes = useStyles()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value)
  }

  return (
    <div className={classes.root} id={id}>
      {label}
      <input type="text" value={value} onChange={handleChange} className={classes.input} />
    </div>
  )
}
