'use client'
import React from 'react'
import { Button } from './animate-ui/components/buttons/button'

function Test() {
  return (
    <Button
      onClick={() => {
        window.location.reload()
      }}
    >
      Click
    </Button>
  )
}

export default Test
