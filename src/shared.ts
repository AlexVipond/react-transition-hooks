export type Css = {
  enter: {
    /**
     * Classes to add right before the element's `display` property
     * is changed to show the element.
     */
    from: string,
    /**
     * Classes to add right after the element's `display` property is
     * changed to show the element. One of these classes should set the
     * `transition` property.
     */
    active: string,
    to: string,
  },
  leave: {
    /**
     * Classes to add right before the transition starts.
     */
    from: string,
    /**
     * Classes to add that will kick off a new transition. One of these
     * classes should set the `transition` property. After this transition
     * ends, the element's `display` property will be set to `none`.
     */
    active: string,
    to: string,
  }
}

type TransitionCssConfig = {
  from: string,
  active: string,
  to: string,
  start: (addFrom: () => void) => void,
  end: (removeTo: () => void) => void,
}

/**
 * @returns A function that cancels an ongoing transition.
 */
export function transitionCss (element: HTMLElement, config: TransitionCssConfig) {
  const from = config.from.split(" ") || [],
        active = config.active.split(" ") || [],
        to = config.to.split(" ") || []

  const addFrom = () => element.classList.add(...from)
  config.start(addFrom)

  const onTransitionEnd = () => {
    element.removeEventListener("transitionend", onTransitionEnd)
    
    requestAnimationFrame(() => {
      const removeTo = () => element.classList.remove(...active, ...to)
      config.end(removeTo)
    })
  }

  element.addEventListener("transitionend", onTransitionEnd)

  requestAnimationFrame(() => {
    element.classList.add(...active)

    requestAnimationFrame(() => {
      element.classList.remove(...from)
      element.classList.add(...to)
    })
  })

  return () => {
    console.log('canceled')

    element.removeEventListener("transitionend", onTransitionEnd)
    element.style.transitionProperty = 'none'
    element.classList.remove(...from, ...active, ...to)

    requestAnimationFrame(() => {
      element.style.transitionProperty = ''
    })
  }
}
