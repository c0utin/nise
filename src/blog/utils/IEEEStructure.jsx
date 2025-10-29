/**
 * IEEE Paper Structure Components
 *
 * Provides React components for creating IEEE-formatted journal articles
 * following official IEEE Author Center guidelines.
 *
 * Official IEEE Article Structure (in order):
 * 1. Title - specific, concise, descriptive (avoid "new", "novel")
 * 2. Authors - with affiliations and contact information
 * 3. Abstract - single paragraph, up to 250 words, self-contained, no references
 * 4. Keywords - 3-5 standardized keywords (use IEEE Thesaurus)
 * 5. First Footnote - publication dates, corresponding author, funding, ethics
 * 6. Introduction - background and motivation
 * 7. Methodology - reproducible methods
 * 8. Results - findings with figures/tables
 * 9. Discussion - interpretation and implications
 * 10. Conclusion - summary and future work
 * 11. References - proper IEEE citation format
 * 12. Acknowledgments - optional, funding and support
 *
 * Features:
 * - IEEE-compliant structure enforcement
 * - Automatic section numbering (I, II, III...)
 * - Subsection numbering (A, B, C...)
 * - Figure and table auto-numbering
 * - Citation support
 * - First footnote generation
 *
 * Reference: https://journals.ieeeauthorcenter.ieee.org/create-your-ieee-journal-article/
 *
 * Usage:
 * import { IEEEPaper, Abstract, IEEEKeywords, Introduction, Methodology,
 *          Results, Discussion, Conclusion, References } from './utils/IEEEStructure'
 */

import React, { createContext, useContext, useState, useEffect } from 'react'

// Context for tracking section numbers
const SectionContext = createContext({ sectionNumber: 0, increment: () => {} })
const FigureContext = createContext({ figureNumber: 0, increment: () => {} })
const TableContext = createContext({ tableNumber: 0, increment: () => {} })

/**
 * Main IEEE Paper Container
 */
export function IEEEPaper({ title, authors = [], children }) {
  const [sectionNumber, setSectionNumber] = useState(0)
  const [figureNumber, setFigureNumber] = useState(0)
  const [tableNumber, setTableNumber] = useState(0)

  const incrementSection = () => setSectionNumber(n => n + 1)
  const incrementFigure = () => setFigureNumber(n => n + 1)
  const incrementTable = () => setTableNumber(n => n + 1)

  return (
    <SectionContext.Provider value={{ sectionNumber, increment: incrementSection }}>
      <FigureContext.Provider value={{ figureNumber, increment: incrementFigure }}>
        <TableContext.Provider value={{ tableNumber, increment: incrementTable }}>
          <article className="ieee-paper">
            {/* Title */}
            {title && (
              <header className="text-center mb-8 pb-6 border-b border-white/10">
                <h1 className="text-3xl font-bold mb-4">{title}</h1>

                {/* Authors */}
                {authors.length > 0 && (
                  <div className="space-y-4">
                    {authors.map((author, idx) => (
                      <div key={idx} className="text-gray-300">
                        <div className="font-semibold">{author.name}</div>
                        {author.affiliation && (
                          <div className="text-sm text-gray-400">{author.affiliation}</div>
                        )}
                        {author.email && (
                          <div className="text-sm text-gray-500">{author.email}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </header>
            )}

            {/* Content */}
            <div className="ieee-paper-content">
              {children}
            </div>
          </article>
        </TableContext.Provider>
      </FigureContext.Provider>
    </SectionContext.Provider>
  )
}

/**
 * Abstract Section (IEEE style)
 * Single paragraph, up to 250 words, self-contained, no abbreviations/references
 */
export function Abstract({ children, wordCount }) {
  const text = typeof children === 'string' ? children : ''
  const words = text.split(/\s+/).filter(w => w.length > 0).length
  const isOverLimit = words > 250

  return (
    <section className="abstract mb-8 p-6 bg-white/5 border border-white/10 rounded-lg">
      <h2 className="text-lg font-bold mb-3">Abstract</h2>
      <div className="text-gray-300 italic leading-relaxed">
        {children}
      </div>
      {isOverLimit && (
        <div className="mt-2 text-xs text-yellow-500">
          Warning: Abstract is {words} words (IEEE limit: 250 words)
        </div>
      )}
      {words > 0 && words <= 250 && (
        <div className="mt-2 text-xs text-gray-500">
          {words} / 250 words
        </div>
      )}
    </section>
  )
}

/**
 * Keywords Section (IEEE style)
 * 3-5 standardized keywords recommended (use IEEE Thesaurus)
 */
export function IEEEKeywords({ keywords = [] }) {
  const count = keywords.length
  const isValid = count >= 3 && count <= 5

  return (
    <section className="keywords mb-8 p-4 bg-white/5 border border-white/10 rounded-lg">
      <div>
        <span className="font-semibold italic text-gray-300">Index Terms—</span>
        <span className="text-gray-400">
          {keywords.join(', ')}
        </span>
      </div>
      {!isValid && (
        <div className="mt-2 text-xs text-yellow-500">
          {count < 3 && `Warning: IEEE recommends 3-5 keywords (currently ${count})`}
          {count > 5 && `Warning: IEEE recommends 3-5 keywords (currently ${count})`}
        </div>
      )}
    </section>
  )
}

// Legacy alias for backward compatibility
export const Keywords = IEEEKeywords

/**
 * First Footnote (IEEE style)
 * Contains publication metadata, corresponding author, funding, ethics statements
 */
export function FirstFootnote({
  manuscriptReceived,
  manuscriptRevised,
  manuscriptAccepted,
  publicationDate,
  correspondingAuthor,
  funding,
  priorPresentation,
  ethics
}) {
  return (
    <section className="first-footnote mb-8 p-4 bg-white/5 border-l-4 border-blue-500/30 text-xs text-gray-400">
      {manuscriptReceived && <div>Manuscript received {manuscriptReceived}</div>}
      {manuscriptRevised && <div>Revised {manuscriptRevised}</div>}
      {manuscriptAccepted && <div>Accepted for publication {manuscriptAccepted}</div>}
      {publicationDate && <div>Date of publication {publicationDate}</div>}
      {correspondingAuthor && (
        <div className="mt-2">
          Corresponding author: {correspondingAuthor.name}
          {correspondingAuthor.email && ` (email: ${correspondingAuthor.email})`}
        </div>
      )}
      {funding && <div className="mt-2">{funding}</div>}
      {priorPresentation && <div className="mt-2">{priorPresentation}</div>}
      {ethics && <div className="mt-2">{ethics}</div>}
    </section>
  )
}

/**
 * Convert number to Roman numerals (IEEE section numbering style)
 */
function toRomanNumeral(num) {
  const romanNumerals = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
    6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
    11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV',
    16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX'
  }
  return romanNumerals[num] || num.toString()
}

/**
 * Convert number to letter (IEEE subsection numbering style)
 */
function toLetter(num) {
  return String.fromCharCode(64 + num) // A=65, B=66, etc.
}

/**
 * Numbered Section (auto-increments with Roman numerals)
 */
export function Section({ title, numbered = true, children }) {
  const { sectionNumber, increment } = useContext(SectionContext)
  const [currentNumber, setCurrentNumber] = useState(null)

  useEffect(() => {
    if (numbered) {
      increment()
      setCurrentNumber(sectionNumber + 1)
    }
  }, [])

  return (
    <section className="ieee-section mb-8">
      <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">
        {numbered && currentNumber && (
          <span>{toRomanNumeral(currentNumber)}. </span>
        )}
        <span>{title}</span>
      </h2>
      <div className="section-content text-gray-300 leading-relaxed">
        {children}
      </div>
    </section>
  )
}

/**
 * Introduction Section (IEEE Article Structure - Section I)
 */
export function Introduction({ children }) {
  return (
    <Section title="Introduction" numbered={true}>
      {children}
    </Section>
  )
}

/**
 * Methodology Section (IEEE Article Structure - typically Section II)
 */
export function Methodology({ children, title = "Methodology" }) {
  return (
    <Section title={title} numbered={true}>
      {children}
    </Section>
  )
}

/**
 * Results Section (IEEE Article Structure)
 */
export function Results({ children, title = "Results" }) {
  return (
    <Section title={title} numbered={true}>
      {children}
    </Section>
  )
}

/**
 * Discussion Section (IEEE Article Structure)
 */
export function Discussion({ children, title = "Discussion" }) {
  return (
    <Section title={title} numbered={true}>
      {children}
    </Section>
  )
}

/**
 * Conclusion Section (IEEE Article Structure - final numbered section)
 */
export function Conclusion({ children, title = "Conclusion" }) {
  return (
    <Section title={title} numbered={true}>
      {children}
    </Section>
  )
}

/**
 * Subsection Context for letter numbering
 */
const SubsectionContext = createContext({ subsectionNumber: 0, increment: () => {}, reset: () => {} })

/**
 * Subsection with letter numbering (A, B, C...)
 */
export function Subsection({ title, numbered = true, children }) {
  const [subsectionNumber, setSubsectionNumber] = useState(0)
  const [currentNumber, setCurrentNumber] = useState(null)

  useEffect(() => {
    if (numbered) {
      setSubsectionNumber(prev => prev + 1)
      setCurrentNumber(subsectionNumber + 1)
    }
  }, [])

  return (
    <div className="ieee-subsection mb-6 ml-4">
      <h3 className="text-lg font-semibold mb-3 text-white italic">
        {numbered && currentNumber && (
          <span>{toLetter(currentNumber)}. </span>
        )}
        <span>{title}</span>
      </h3>
      <div className="subsection-content text-gray-300 leading-relaxed">
        {children}
      </div>
    </div>
  )
}

/**
 * Figure with IEEE-style caption
 */
export function Figure({ src, alt, caption, label }) {
  const { figureNumber, increment } = useContext(FigureContext)
  const [currentNumber, setCurrentNumber] = useState(null)

  useEffect(() => {
    increment()
    setCurrentNumber(figureNumber + 1)
  }, [])

  return (
    <figure className="ieee-figure my-8 text-center" id={label}>
      <div className="figure-content mb-3 bg-white/5 border border-white/10 rounded-lg p-4">
        {src ? (
          <img src={src} alt={alt || caption} className="max-w-full mx-auto" />
        ) : (
          <div className="figure-placeholder">{children}</div>
        )}
      </div>
      <figcaption className="text-sm text-gray-400">
        <span className="font-semibold">Fig. {currentNumber}.</span> {caption}
      </figcaption>
    </figure>
  )
}

/**
 * Table with IEEE-style caption
 */
export function Table({ caption, label, children }) {
  const { tableNumber, increment } = useContext(TableContext)
  const [currentNumber, setCurrentNumber] = useState(null)

  useEffect(() => {
    increment()
    setCurrentNumber(tableNumber + 1)
  }, [])

  return (
    <figure className="ieee-table my-8" id={label}>
      <figcaption className="text-sm text-gray-400 mb-2 text-center">
        <span className="font-semibold">TABLE {currentNumber}</span>
        <br />
        {caption}
      </figcaption>
      <div className="table-content overflow-x-auto">
        <table className="w-full border-collapse bg-white/5 border border-white/10 rounded-lg">
          {children}
        </table>
      </div>
    </figure>
  )
}

/**
 * Inline citation reference
 */
export function Citation({ id, children }) {
  return (
    <sup>
      <a href={`#ref-${id}`} className="citation text-blue-400 hover:text-blue-300">
        [{children || id}]
      </a>
    </sup>
  )
}

/**
 * References Section
 */
export function References({ children, references = [] }) {
  return (
    <section className="ieee-references mt-12 pt-8 border-t border-white/10">
      <h2 className="text-2xl font-bold mb-6">References</h2>
      <ol className="space-y-3 text-sm text-gray-400">
        {references.map((ref, idx) => (
          <li key={idx} id={`ref-${idx + 1}`} className="flex gap-3">
            <span className="font-semibold text-gray-500">[{idx + 1}]</span>
            <div>
              {ref.authors && <span className="text-gray-300">{ref.authors}, </span>}
              {ref.title && <span className="italic">"{ref.title}," </span>}
              {ref.journal && <span className="italic">{ref.journal}, </span>}
              {ref.volume && <span>vol. {ref.volume}, </span>}
              {ref.number && <span>no. {ref.number}, </span>}
              {ref.pages && <span>pp. {ref.pages}, </span>}
              {ref.year && <span>{ref.year}.</span>}
              {ref.doi && (
                <span> DOI: <a href={`https://doi.org/${ref.doi}`} className="text-blue-400 hover:text-blue-300">{ref.doi}</a></span>
              )}
            </div>
          </li>
        ))}
        {children}
      </ol>
    </section>
  )
}

/**
 * Individual Reference Item (when not using array)
 */
export function Reference({ number, authors, title, journal, volume, pages, year, doi }) {
  return (
    <li id={`ref-${number}`} className="flex gap-3">
      <span className="font-semibold text-gray-500">[{number}]</span>
      <div>
        {authors && <span className="text-gray-300">{authors}, </span>}
        {title && <span className="italic">"{title}," </span>}
        {journal && <span className="italic">{journal}, </span>}
        {volume && <span>vol. {volume}, </span>}
        {pages && <span>pp. {pages}, </span>}
        {year && <span>{year}.</span>}
        {doi && (
          <span> DOI: <a href={`https://doi.org/${doi}`} className="text-blue-400 hover:text-blue-300">{doi}</a></span>
        )}
      </div>
    </li>
  )
}

/**
 * Two-column layout (IEEE conference style)
 */
export function TwoColumnLayout({ children }) {
  return (
    <div className="ieee-two-column grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  )
}

/**
 * Acknowledgments Section (optional, after references)
 */
export function Acknowledgments({ children }) {
  return (
    <section className="ieee-acknowledgments mt-8 mb-8 p-4 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Acknowledgments</h3>
      <div className="text-sm text-gray-400">
        {children}
      </div>
    </section>
  )
}

/**
 * Complete IEEE Article Template Example
 *
 * Following IEEE Author Center guidelines:
 * https://journals.ieeeauthorcenter.ieee.org/create-your-ieee-journal-article/
 *
 * Structure (in order):
 * 1. Title (specific, concise, descriptive)
 * 2. Authors (with affiliations)
 * 3. Abstract (≤250 words, self-contained)
 * 4. Keywords (3-5 terms from IEEE Thesaurus)
 * 5. First Footnote (dates, corresponding author, funding)
 * 6. I. Introduction
 * 7. II. Methodology
 * 8. III. Results
 * 9. IV. Discussion
 * 10. V. Conclusion
 * 11. References (not numbered)
 * 12. Acknowledgments (optional)
 */
export const IEEEArticleTemplate = () => (
  <IEEEPaper
    title="Title: Specific, Concise, and Descriptive (Avoid 'Novel' or 'New')"
    authors={[
      {
        name: "First Author",
        affiliation: "Department, University Name",
        email: "first@university.edu"
      },
      {
        name: "Second Author",
        affiliation: "Department, Institution Name",
        email: "second@institution.edu"
      }
    ]}
  >
    <Abstract>
      Single paragraph, up to 250 words. Self-contained with no abbreviations
      or references. Highlight novel aspects of your research. State the problem,
      your approach, key results, and main conclusions clearly and concisely.
    </Abstract>

    <IEEEKeywords keywords={[
      'Keyword 1',
      'Keyword 2',
      'Keyword 3',
      'Keyword 4',
      'Keyword 5'
    ]} />

    <FirstFootnote
      manuscriptReceived="January 1, 2025"
      manuscriptRevised="February 1, 2025"
      manuscriptAccepted="March 1, 2025"
      correspondingAuthor={{
        name: "First Author",
        email: "first@university.edu"
      }}
      funding="This work was supported by Grant #12345 from Funding Agency."
      ethics="All experiments were conducted in accordance with ethical guidelines."
    />

    <Introduction>
      Provide background, motivation, and context. Review related work.
      State your research objectives and contributions clearly.
    </Introduction>

    <Methodology title="Methodology">
      <Subsection title="Experimental Setup" numbered>
        Describe your methods in sufficient detail for reproducibility.
      </Subsection>

      <Subsection title="Data Collection" numbered>
        Include equations, algorithms, and procedures.
      </Subsection>
    </Methodology>

    <Results>
      <Figure caption="Description of the figure content" label="fig1">
        {/* Figure content */}
      </Figure>

      Present findings with figures and tables. Reference them in text
      (e.g., "As shown in Fig. 1...").
    </Results>

    <Discussion>
      Interpret your results. Compare with previous work. Discuss implications
      and limitations. Explain what your findings mean.
    </Discussion>

    <Conclusion>
      Summarize main contributions. Suggest future work. Keep it concise
      and focused on key takeaways.
    </Conclusion>

    <References references={[
      {
        authors: "A. Author, B. Author, and C. Author",
        title: "Title of the article",
        journal: "IEEE Transactions on Journal Name",
        volume: "42",
        number: "3",
        pages: "123-145",
        year: "2024",
        doi: "10.1109/EXAMPLE.2024.1234567"
      }
    ]} />

    <Acknowledgments>
      Thank funding sources, colleagues who contributed, and institutional support.
    </Acknowledgments>
  </IEEEPaper>
)
