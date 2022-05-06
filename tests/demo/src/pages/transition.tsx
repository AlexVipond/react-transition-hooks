import React, { useState, useRef, useLayoutEffect } from 'react'
import useTransition from '../../../../src/useTransition'
import './transition.css'

export default function () {
  const [isShown, setIsShown] = useState(false)
  const element = useRef(null)
  
  const transition = useTransition(
    element,
    isShown,
    {
      enter: {
        from: 'enter-from',
        active: 'enter-active',
        to: 'enter-to',
      },
      leave: {
        from: 'leave-from',
        active: 'leave-active',
        to: 'leave-to',
      }
    }
  )

  const input = useRef(null)

  useLayoutEffect(() => {
    if (transition.status === 'entered') input.current.focus()
  }, [transition])

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => setIsShown(!isShown)}>Set to {`${!isShown}`}</button>
      {transition.shouldRender
        ? <div
          className="mx-auto bg-blue-200 text-blue-900"
          ref={element}
        >
          <input ref={input} placeholder="element" />
        </div>
        : <></>
      }
      <span className="mx-auto">{transition.status}</span>
    </div>
  )
}
