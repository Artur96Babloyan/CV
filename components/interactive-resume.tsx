"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ABOUT_TEXT,
  CONTACT,
  EDUCATION,
  EXPERIENCE,
  PROJECTS,
  SKILLS,
} from "@/lib/cv-data";
import { CvScene3d } from "@/components/cv-scene-3d";
import { MarioMiniGame } from "@/components/mario-mini-game";
import { SectionGuide } from "@/components/section-guide";

const SECTIONS = [
  {
    id: 1,
    title: "Introduction",
    subtitle: "Overview and contact",
    guide:
      "Warm-up: play the mini-scroller above — mushrooms grow your hero; flag clears the stage. Then read on.",
  },
  {
    id: 2,
    title: "Profile",
    subtitle: "Professional summary",
    guide: "The story beat: how I approach frontend work and what I optimize for.",
  },
  {
    id: 3,
    title: "Capabilities",
    subtitle: "Technical skills",
    guide: "Power-ups — languages, frameworks, and practices I ship with in production.",
  },
  {
    id: 4,
    title: "Experience",
    subtitle: "Roles and impact",
    guide: "The levels you cleared — companies, titles, dates, and what I delivered.",
  },
  {
    id: 5,
    title: "Selected work",
    subtitle: "Representative projects",
    guide: "Side quests worth opening: live sites and platforms to explore in new tabs.",
  },
  {
    id: 6,
    title: "Education",
    subtitle: "Credentials and next steps",
    guide: "End credits — formal training, then jump back to the standard CV or LinkedIn.",
  },
] as const;

const SECTION_COUNT = SECTIONS.length;

export function InteractiveResume() {
  const mainRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    const id = requestAnimationFrame(() => apply());
    mq.addEventListener("change", apply);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener("change", apply);
    };
  }, []);

  const syncDocumentProgress = useCallback(() => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    setProgress(max > 0 ? window.scrollY / max : 0);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      syncDocumentProgress();
    });
    window.addEventListener("scroll", syncDocumentProgress, { passive: true });
    window.addEventListener("resize", syncDocumentProgress, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", syncDocumentProgress);
      window.removeEventListener("resize", syncDocumentProgress);
    };
  }, [syncDocumentProgress]);

  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-play-section]")].sort(
      (a, b) => Number(a.dataset.playSection) - Number(b.dataset.playSection),
    );
    if (nodes.length === 0) return;

    const pickActive = () => {
      const mid = window.innerHeight * 0.38;
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      nodes.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height * 0.35;
        const d = Math.abs(center - mid);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      });
      setSectionIndex(bestIdx);
    };

    const obs = new IntersectionObserver(
      () => {
        pickActive();
      },
      { threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1], rootMargin: "-18% 0px -42% 0px" },
    );

    nodes.forEach((el) => obs.observe(el));
    pickActive();
    window.addEventListener("scroll", pickActive, { passive: true });

    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", pickActive);
    };
  }, []);

  const scrollToSection = useCallback((index: number) => {
    const root = mainRef.current;
    const el = root?.querySelector<HTMLElement>(`[data-play-section="${index}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToSection(Math.min(SECTION_COUNT - 1, sectionIndex + 1));
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToSection(Math.max(0, sectionIndex - 1));
      }
      if (e.key === "Home") {
        e.preventDefault();
        scrollToSection(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        scrollToSection(SECTION_COUNT - 1);
      }
    },
    [scrollToSection, sectionIndex],
  );

  const section = SECTIONS[sectionIndex] ?? SECTIONS[0];

  return (
    <div
      className="play-root"
      style={{ "--play-section-idx": sectionIndex } as React.CSSProperties}
    >
      <CvScene3d
        sectionIndex={sectionIndex}
        scrollProgress={progress}
        disabled={reduceMotion}
      />
      <div className="play-vignette" aria-hidden />
      <div className="play-light-wash" aria-hidden />

      <a href="#play-world" className="play-skip">
        Skip to narrative
      </a>

      <header className="play-hud" aria-label="Reading progress">
        <div className="play-hud-left">
          <span className="play-hud-kicker">Portfolio narrative · 3D scene</span>
          <span className="play-hud-title">{section.title}</span>
          <span className="play-hud-sub">
            Section {section.id} of {SECTION_COUNT} — {section.subtitle}
          </span>
        </div>
        <div className="play-hud-center">
          <div
            className="play-progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label="Page scroll position"
          >
            <div className="play-progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="play-progress-label">Reading progress</span>
        </div>
        <nav className="play-hud-right" aria-label="Alternate formats">
          <Link href="/" className="play-btn play-btn--ghost">
            Standard CV
          </Link>
          <a href={`mailto:${CONTACT.email}`} className="play-btn">
            Email
          </a>
        </nav>
      </header>

      <p className="play-hint" id="play-instructions">
        Introduction includes a tiny Mario-style warm-up (mushrooms make you grow, then grab the
        flag). Each section has a guide on wide screens. Lighting and the 3D scene follow your scroll.
        Use arrow keys on the page (outside the game) or dots to jump sections — click the game first
        to use its controls.
      </p>

      <div className="play-mobile-guide" aria-live="polite">
        <span className="play-mobile-guide-kicker">
          Level {section.id} / {SECTION_COUNT}
        </span>
        <span className="play-mobile-guide-title">{section.title}</span>
        <span className="play-mobile-guide-text">{section.guide}</span>
      </div>

      <nav className="play-rail" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`play-rail-dot ${i === sectionIndex ? "play-rail-dot--active" : ""}`}
            aria-label={`Go to ${s.title}`}
            aria-current={i === sectionIndex ? "true" : undefined}
            onClick={() => scrollToSection(i)}
          />
        ))}
      </nav>

      <main
        id="play-world"
        ref={mainRef}
        className="play-main"
        tabIndex={0}
        role="region"
        aria-labelledby="play-instructions"
        onKeyDown={onKeyDown}
      >
        <section className="play-section" data-play-section={0} aria-labelledby="play-l1">
          <SectionGuide section={SECTIONS[0]} levelCount={SECTION_COUNT} reduceMotion={reduceMotion} />
          <div className="play-section-panel play-panel play-panel--hero">
            <div className="play-section-inner">
              <MarioMiniGame reduceMotion={reduceMotion} />
              <div className="play-eyebrow">Overview</div>
              <h1 id="play-l1" className="play-hero-name">
                Artur Babloyan
              </h1>
              <p className="play-hero-role">Senior Frontend Developer</p>
              <p className="play-hero-copy">
                Above: a tiny side-scroller — grab red mushrooms to grow (Small → Super → Mega), then
                touch the flag. Full-page narrative with a live Three.js scene below. Each section has a
                guide on wide screens, inspired by{" "}
                <a
                  href="http://www.rleonardi.com/interactive-resume/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="play-inline-link"
                >
                  Robby Leonardi&apos;s interactive résumé
                </a>
                . Same résumé content as the standard CV.
              </p>
              <ul className="play-hero-meta">
                <li>{CONTACT.location}</li>
                <li>
                  <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="play-section" data-play-section={1} aria-labelledby="play-l2">
          <SectionGuide section={SECTIONS[1]} levelCount={SECTION_COUNT} reduceMotion={reduceMotion} />
          <div className="play-section-panel play-panel play-panel--about">
            <div className="play-section-inner">
              <h2 id="play-l2" className="play-panel-title">
                About
              </h2>
              <p className="play-panel-text">{ABOUT_TEXT}</p>
            </div>
          </div>
        </section>

        <section className="play-section" data-play-section={2} aria-labelledby="play-l3">
          <SectionGuide section={SECTIONS[2]} levelCount={SECTION_COUNT} reduceMotion={reduceMotion} />
          <div className="play-section-panel play-panel play-panel--skills">
            <div className="play-section-inner">
              <h2 id="play-l3" className="play-panel-title">
                Technical skills
              </h2>
              <p className="play-panel-lead">Core technologies and practices used in recent roles.</p>
              <ul className="play-skill-cloud">
                {SKILLS.map((skill) => (
                  <li key={skill} className="play-skill-chip">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="play-section" data-play-section={3} aria-labelledby="play-l4">
          <SectionGuide section={SECTIONS[3]} levelCount={SECTION_COUNT} reduceMotion={reduceMotion} />
          <div className="play-section-panel play-panel play-panel--jobs">
            <div className="play-section-inner">
              <h2 id="play-l4" className="play-panel-title">
                Professional experience
              </h2>
              <div className="play-job-row">
                {EXPERIENCE.map((job) => (
                  <article key={job.company} className="play-job-card">
                    <header className="play-job-head">
                      <span className="play-job-company">{job.company}</span>
                      <span className="play-job-role">{job.role}</span>
                      <span className="play-job-dates">{job.dates}</span>
                    </header>
                    <ul className="play-job-list">
                      {job.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="play-section" data-play-section={4} aria-labelledby="play-l5">
          <SectionGuide section={SECTIONS[4]} levelCount={SECTION_COUNT} reduceMotion={reduceMotion} />
          <div className="play-section-panel play-panel play-panel--projects">
            <div className="play-section-inner">
              <h2 id="play-l5" className="play-panel-title">
                Selected projects
              </h2>
              <div className="play-project-row">
                {PROJECTS.map((p) => (
                  <article key={p.href} className="play-project-card">
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="play-project-link"
                    >
                      {p.label}
                    </a>
                    <p>{p.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="play-section" data-play-section={5} aria-labelledby="play-l6">
          <SectionGuide section={SECTIONS[5]} levelCount={SECTION_COUNT} reduceMotion={reduceMotion} />
          <div className="play-section-panel play-panel play-panel--finale">
            <div className="play-section-inner">
              <h2 id="play-l6" className="play-panel-title">
                Education
              </h2>
              <div className="play-finale-card">
                <p className="play-degree">{EDUCATION.degree}</p>
                <p className="play-school">{EDUCATION.school}</p>
                <p className="play-period">{EDUCATION.period}</p>
              </div>
              <p className="play-finale-msg">
                End of narrative view. The standard CV is available for a compact layout.
              </p>
              <div className="play-finale-actions">
                <Link href="/" className="play-btn play-btn--large">
                  Open standard CV
                </Link>
                <a
                  href={CONTACT.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="play-btn play-btn--ghost play-btn--large"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
