"use client";

export type GuideSection = {
  readonly id: number;
  readonly title: string;
  readonly subtitle: string;
  readonly guide: string;
};

type SectionGuideProps = {
  section: GuideSection;
  levelCount: number;
  reduceMotion: boolean;
};

export function SectionGuide({ section, levelCount, reduceMotion }: SectionGuideProps) {
  return (
    <aside
      className={`play-section-guide ${reduceMotion ? "play-section-guide--static" : ""}`}
      aria-label={`Guide for ${section.title}`}
    >
      <div className="play-section-guide-track" aria-hidden>
        <span className="play-section-guide-track-line" />
      </div>

      <div className="play-section-guide-body">
        <div className="play-section-guide-figure" aria-hidden>
          <svg viewBox="0 0 72 96" className="play-section-guide-svg" role="img">
            <title>Section guide</title>
            <ellipse cx="36" cy="88" rx="18" ry="4" fill="rgba(0,0,0,0.35)" />
            <g className="play-section-guide-pose">
              <rect x="22" y="38" width="28" height="34" rx="8" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="2" />
              <circle cx="36" cy="24" r="14" fill="#fde68a" stroke="#334155" strokeWidth="2" />
              <circle cx="31" cy="22" r="2.5" fill="#0f172a" />
              <circle cx="41" cy="22" r="2.5" fill="#0f172a" />
              <path d="M30 30 Q36 34 42 30" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="14" y="44" width="10" height="8" rx="3" fill="#334155" transform="rotate(-18 19 48)" />
              <rect x="48" y="44" width="10" height="8" rx="3" fill="#334155" transform="rotate(18 53 48)" />
              <rect x="26" y="72" width="10" height="18" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
              <rect x="36" y="72" width="10" height="18" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        <div className="play-section-guide-bubble">
          <span className="play-section-guide-kicker">
            Level {section.id} / {levelCount}
          </span>
          <strong className="play-section-guide-title">{section.title}</strong>
          <p className="play-section-guide-text">{section.guide}</p>
        </div>
      </div>
    </aside>
  );
}
