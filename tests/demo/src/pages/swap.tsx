import React, { useState, useRef, useLayoutEffect } from 'react'
import useSwap from '../../../../src/useSwap'
import './transition.css'

export default function () {
  const [shown, setShown] = useState('element1')
  const element1 = useRef(null)
  const element2 = useRef(null)
  
  const swap = useSwap(
    { element1, element2 },
    shown,
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

  const input1 = useRef(null)
  
  useLayoutEffect(() => {
    if (swap.statuses.element1 === 'entered') input1.current.focus()
  }, [swap])
  
  const input2 = useRef(null)

  useLayoutEffect(() => {
    if (swap.statuses.element2 === 'entered') input2.current.focus()
  }, [swap])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button onClick={() => setShown('element1')}>Show element1</button>
        <button onClick={() => setShown('element2')}>Show element2</button>
      </div>
      {(() => {
        switch (swap.shouldRender) {
          case 'element1':
            return <div
              className="mx-auto bg-blue-200 text-blue-900"
              ref={element1}
            >
              <input ref={input1} placeholder="element1" />
            </div>
          case 'element2':
            return <div
              className="mx-auto bg-blue-200 text-blue-900"
              ref={element2}
            >
              <input ref={input2} placeholder="element2" />
            </div>
        }
      })()}
      <span className="mx-auto">{shown}</span>
      <span className="mx-auto">{JSON.stringify(swap.statuses, null, 2)}</span>
    </div>
  )
}
