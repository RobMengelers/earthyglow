import { useState } from 'react'

export type Faq = { question: string; answer: string }

/** One question of a FAQ list; the answer opens and closes in place. Styles live in Care.css. */
export function FaqItem({ question, answer, index }: Faq & { index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item${open ? ' is-open' : ''}`}>
      <button
        className="faq-question"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="faq-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="faq-question-text">{question}</span>
        <span className="faq-toggle" aria-hidden="true">+</span>
      </button>
      <div className="faq-answer" aria-hidden={!open}>
        <p>{answer}</p>
      </div>
    </div>
  )
}
