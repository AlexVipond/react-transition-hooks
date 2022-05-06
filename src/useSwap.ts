import {
  MutableRefObject,
  useState,
  useRef,
  useMemo,
  useLayoutEffect,
  useReducer,
} from 'react'
import { Css, transitionCss } from './shared'

/**
 * 
 * @param elements An object whose keys are strings identifying elements that will be
   swapped, and whose values are refs for those elements.
 * @param shown Reactive string that identifies the element to show. Reactive
   updates to `shown` will trigger a new swap.
 * @param css An object that configures a CSS transition. See type declaration for
    further documentation.
 * @returns A memoized reactive object with a `statuses` and a `shouldRender` property.
    
    `statuses` is an object whose keys are strings identifying elements that will be
    swapped, and whose values are more detailed transitioned statuses that can inform the
    timing of different side effects. For example, when `statuses.myElement` changes
    to `entered`, the element has fully transitioned in, and you can safely
    focus an input, a button, etc.

    The value of `shouldRender` is a string that identifies one of the elements. You should use
    `shouldRender` inside a switch statement for conditional rendering.
 */
export default function useSwap(
  elements: { [id: string]: MutableRefObject<HTMLElement> },
  shown: string,
  css: Css
) {
  const statuses = useRef<
    { [id: string]: 'entering' | 'entered' | 'leaving' | 'left' }
  >((() => {
    const statuses = {}

    for (const id in elements) {
      // @ts-ignore
      statuses.current[id] = shown === id ? 'entered' : 'left'
    }

    return statuses
  })())
  const [_, forceUpdate] = useReducer(x => x + 1, 0)
  const cachedDisplays = useRef<{ [id: string]: string }>({})
  const cancel = useRef<() => void>(() => {})

  function enter (id: string) {
    const transition = () => {
      cancel.current = transitionCss(elements[id].current, {
        ...css.enter,
        start: addFrom => {
          addFrom()
          elements[id].current.style.display = cachedDisplays.current[id] || 'block'
          statuses.current = getNewStatuses(elements, id, 'entering')
          forceUpdate()
        },
        end: removeTo => {
          removeTo()
          statuses.current = getNewStatuses(elements, id, 'entered')
          forceUpdate()
        },
      })
    }

    if (!cachedDisplays.current[id]) {
      statuses.current = getNewStatuses(elements, id, 'entering')
      forceUpdate()

      // Wait for styles to compute
      requestAnimationFrame(() => {
        const display = window.getComputedStyle(elements[id].current).display
        cachedDisplays.current[id] = (display === 'none' || !display) ? 'block' : display
        transition()
      })
      return
    }
    
    transition()
  }

  function swap () {
    const entered = (() => {
      for (const id in elements) {
        if (statuses.current[id] === 'entered') return id
      }
    })() as string

    if (!elements[entered]) return

    cancel.current = transitionCss(elements[entered].current, {
      ...css.leave,
      start: addFrom => {
        addFrom()
        statuses.current = getNewStatuses(elements, entered, 'leaving')
        forceUpdate()
      },
      end: removeTo => {
        elements[entered].current.style.display = 'none'
        removeTo()
        statuses.current = getNewStatuses(elements, entered, 'left')
        forceUpdate()
        enter(shown)
      },
    })
  }

  useLayoutEffect(() => {
    // Give the browser a chance to render the new element
    requestAnimationFrame(() => {
      let someElementIsRendered = false
      for (const id in elements) {
        if (elements[id].current) someElementIsRendered = true
      }
      if (!someElementIsRendered) return

      for (const id in elements) {
        if (!elements[id].current) continue

        if (!cachedDisplays.current[id]) {
          const display = window.getComputedStyle(elements[id].current).display
          cachedDisplays.current[id] = (display === 'none' || !display) ? 'block' : display
          if (id !== shown && statuses.current[id] === 'left') elements[id].current.style.display = 'none'
        }
      }

      if (statuses.current[shown] !== 'left') return

      // TRANSITION OR CANCEL
      const leaving = (() => {
        for (const id in elements) {
          if (statuses.current[id] === 'leaving') return id
        }
      })()

      console.log({ shown, leaving, statuses: JSON.parse(JSON.stringify(statuses)) })

      if (shown === leaving) {
        cancel.current()
        statuses.current = getNewStatuses(elements, leaving, 'entered')
        forceUpdate()
        return
      }

      // const entering = (() => {
      //   for (const id in elements) {
      //     if (statuses.current[id] === 'entering') return id
      //   }
      // })()

      // if (entering && entering !== shown) {
      //   console.log('entering')
      //   cancel.current()
      //   elements[entering].current.style.display = 'none'
      //   statuses.current = getNewStatuses(elements, entering, 'left')
      forceUpdate()
        
      //   // Wait for conditional rendering to catch up with statuses change
      //   requestAnimationFrame(() => enter(shown))

      //   return
      // }

      swap()
    })
  }, [shown])

  return useMemo(
    () => ({
      statuses: statuses.current,
      shouldRender: (() => {
        for (const id in elements) {
          if (statuses.current[id] !== 'left') return id
        }

        return shown
      })(),
    }),
    [shown]
  )
}

function getNewStatuses (
  elements: { [id: string]: MutableRefObject<HTMLElement> },
  id: string,
  status: 'entering' | 'entered' | 'leaving' | 'left'
) {
  const statuses = {}

  for (const i in elements) {
    // @ts-ignore
    statuses.current[i] = i === id ? status : 'left'
  }

  return statuses
}
