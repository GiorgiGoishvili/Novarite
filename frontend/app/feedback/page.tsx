// Prototype feedback page — supports homework requirement to collect user testing feedback.

const TASKS = [
  "Open the homepage and explain what Novarite does.",
  "Browse the available games.",
  "Open a game details modal.",
  "Read the reviews and ratings.",
  "Try both payment choices for Little Runmo: Pay with SOL and Pay with Card.",
  "Try the upload game page.",
  "Check the developer dashboard.",
];

const QUESTIONS = [
  "Was the homepage clear?",
  "Was browsing games easy?",
  "Did the game details page give enough information?",
  "Did reviews and ratings increase trust?",
  "Were the two payment options (SOL and Card) understandable?",
  "Was the upload page understandable?",
  "What confused you?",
  "What should be improved first?",
];

const GOOGLE_FORM_URL = "https://forms.gle/Utds5aEJn3pCn9x77";

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-nr-surface">
      <div className="mx-auto max-w-2xl px-5 py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="mb-1.5 font-sans text-xs font-semibold uppercase tracking-widest text-nr-red">
            User Testing
          </p>
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-nr-ink">
            Prototype Feedback
          </h1>
          <p className="mt-4 font-sans text-base leading-relaxed text-nr-body">
            Help us test the Novarite MVP prototype. Complete the tasks below, then submit your feedback.
          </p>
        </div>

        <div className="flex flex-col gap-8">

          {/* Tasks */}
          <section className="rounded-xl border border-nr-border bg-white p-7 shadow-card">
            <h2 className="mb-4 font-sans text-lg font-bold text-nr-ink">Testing Tasks</h2>
            <ol className="flex flex-col gap-3">
              {TASKS.map((task, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nr-red font-sans text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="font-sans text-sm leading-relaxed text-nr-body">{task}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Feedback questions */}
          <section className="rounded-xl border border-nr-border bg-white p-7 shadow-card">
            <h2 className="mb-4 font-sans text-lg font-bold text-nr-ink">Feedback Questions</h2>
            <ul className="flex flex-col gap-3">
              {QUESTIONS.map((q, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="mt-0.5 shrink-0 text-nr-faint"
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                  </svg>
                  <span className="font-sans text-sm leading-relaxed text-nr-body">{q}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Submit feedback */}
          <section className="rounded-xl border border-nr-border bg-white p-7 shadow-card">
            <h2 className="mb-2 font-sans text-lg font-bold text-nr-ink">Submit Feedback</h2>
            <p className="mb-5 font-sans text-sm text-nr-muted">
              After completing the tasks, open the feedback form and answer the questions above.
            </p>
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-nr-red px-6 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-nr-redhover"
            >
              Open Feedback Form
            </a>
          </section>

          {/* Back link */}
          <div>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-nr-muted transition-colors hover:text-nr-ink"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Browse
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}
