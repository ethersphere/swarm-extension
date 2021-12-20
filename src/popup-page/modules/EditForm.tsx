import React, { useContext, useEffect, useState } from 'react'
import { createUseStyles } from 'react-jss'

import { GlobalContext } from '../context/global'
import Button from './Button'

const useStyles = createUseStyles({
  root: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
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
      <input
        type="text"
        value={value}
        onChange={handleChange}
        style={{ backgroundColor: 'rgba(0,0,0,0)', border: 'none', textAlign: 'right' }}
      />
      {/*<Button value="Change" onClick={handleSubmit} />*/}
    </div>
  )
}
