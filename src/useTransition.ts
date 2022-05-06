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
 * @param element A ref for an element that will be transitioned in and out
 * @param isShown Reactive boolean state that kicks off an enter or leave transition.
 * @param css An object that configures a CSS transition. See type declaration for
    further documentation.
 * @returns A memoized reactive object with a `status` and a `shouldRender` property.
    
    `status` is a more detailed transitioned status that can inform the
    timing of different side effects. For example, when `status` changes
    to `entered`, the element has fully transitioned in, and you can safely
    focus an input, a button, etc.

    `shouldRender` is boolean that is `true` when `isShown` is `true` OR when `status`
    is `leaving`. You should use `shouldRender` instead of `isShown` for conditional rendering.
 */
export default function useTransition(
  element: MutableRefObject<HTMLElement>,
  isShown: boolean,
  css: Css
) {
  const status = useRef<
    'entering' | 'entered' | 'leaving' | 'left'
  >(!isShown ? 'left' : 'entered')
  const [_, forceUpdate] = useReducer(x => x + 1, 0)
  const cachedDisplay = useRef<string>(null)
  const cancel = useRef<() => void>(() => {})

  function enter () {
    cancel.current = transitionCss(element.current, {
      ...css.enter,
      start: addFrom => {
        addFrom()
        // @ts-ignore
        element.current.style.display = cachedDisplay.current
        status.current = 'entering'
        forceUpdate()
      },
      end: removeTo => {
        removeTo()
        status.current = 'entered'
        forceUpdate()
      },
    })
  }

  function leave () {
    cancel.current = transitionCss(element.current, {
      ...css.leave,
      start: addFrom => {
        addFrom()
        status.current = 'leaving'
        forceUpdate()
      },
      end: removeTo => {
        element.current.style.display = 'none'
        removeTo()
        status.current = 'left'
        forceUpdate()
      },
    })
  }

  useLayoutEffect(() => {
    // Give the browser a chance to render the new element
    requestAnimationFrame(() => {
      if (!element.current) return

      if (!cachedDisplay.current) {
        const display = window.getComputedStyle(element.current).display
        // @ts-ignore
        cachedDisplay.current = (display === 'none' || !display) ? 'block' : display
        if (!isShown) element.current.style.display = 'none'
      }

      if (status.current === 'entering' || status.current === 'leaving') {
        cancel.current()
        
        if (status.current === 'entering') {
          status.current = 'left'
          forceUpdate()
        }
        else if (status.current === 'leaving') {
          status.current = 'entered'
          forceUpdate()
        }
        
        return
      }

      if (isShown) enter()
      else leave()
    })
  }, [isShown, status])

  return useMemo(
    () => ({
      status: status.current,
      shouldRender: isShown || status.current !== 'left',
    }),
    [isShown]
  )
}
