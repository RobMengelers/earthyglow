import { useEffect, useRef, type RefObject } from 'react'
import { useLocale } from './hooks'

// Entry animations of the page (see Hero.css) that replay on a language switch:
// the hero text rising in and the hero image scaling in.
const REPLAYED_ANIMATIONS = new Set(['riseUp', 'visualIn'])

/**
 * Replays the page's entry animations when the visitor switches language, so
 * the new text eases in the way it did on the first visit. Nothing remounts:
 * filled-in forms and chosen product options stay as they are.
 */
export function useLocaleSwitchAnimation(root: RefObject<HTMLElement | null>) {
  const locale = useLocale()
  const previous = useRef(locale)

  useEffect(() => {
    if (previous.current === locale) return
    previous.current = locale
    const container = root.current
    if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // The hero: restart the very CSS animations of the first load, with their
    // own delays and stagger.
    for (const animation of container.getAnimations({ subtree: true })) {
      if (animation instanceof CSSAnimation && REPLAYED_ANIMATIONS.has(animation.animationName)) {
        animation.currentTime = 0
        animation.play()
      }
    }

    // Sections that faded up on scroll: fade the ones on screen up again.
    const viewport = window.innerHeight
    const revealed = Array.from(container.querySelectorAll<HTMLElement>('.reveal.is-in-view')).filter((element) => {
      const { top, bottom } = element.getBoundingClientRect()
      return bottom > 0 && top < viewport
    })
    // Hide them instantly (no transition), let the browser apply that, then
    // reveal again so the usual fade-up runs from the start.
    for (const element of revealed) {
      element.style.transitionProperty = 'none'
      element.classList.remove('is-in-view')
    }
    void container.offsetHeight
    for (const element of revealed) {
      element.style.transitionProperty = ''
      element.classList.add('is-in-view')
    }

    // The menu and footer only swap words; a short fade keeps that soft.
    for (const element of container.querySelectorAll<HTMLElement>('.nav-links, .nav-actions, .footer-grid, .footer-bottom')) {
      element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' })
    }
  }, [locale, root])
}
