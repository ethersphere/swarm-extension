import React, { useContext, useEffect, useState } from 'react'
import { createUseStyles } from 'react-jss'

import { GlobalContext } from '../context/global'
import Button from './Button'

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
  label: string
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
}

export default function EditForm({ label, value, onChange, onSubmit }): JSX.Element {
  const classes = useStyles()

  const handleSubmit = (): void => {
    onSubmit(value)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value)
  }

  return (
    <div className={classes.root}>
      {label}
      <input type="text" value={value} onChange={handleChange} className={classes.input} />
      {/*<Button value="Change" onClick={handleSubmit} />*/}
    </div>
  )
}
