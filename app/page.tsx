import Link from "next/link";
import { ABOUT_TEXT, CONTACT, EDUCATION, EXPERIENCE, PROJECTS, SKILLS } from "@/lib/cv-data";

export default function Home() {
  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1 className="name">Artur Babloyan</h1>
          <p className="title">Senior Frontend Developer</p>

          <p className="header-play">
            <Link href="/play" className="header-play-link">
              Portfolio narrative view →
            </Link>
          </p>

          <div className="contact-info">
            <a href={`mailto:${CONTACT.email}`} className="contact-item contact-link">
              <span className="icon" aria-hidden>
                ✉
              </span>
              <span>{CONTACT.email}</span>
            </a>
            <span className="contact-item">
              <span className="icon" aria-hidden>
                📱
              </span>
              <span>{CONTACT.phone}</span>
            </span>
            <span className="contact-item">
              <span className="icon" aria-hidden>
                📍
              </span>
              <span>{CONTACT.location}</span>
            </span>
            <a
              href={CONTACT.linkedin}
              className="contact-item contact-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="icon" aria-hidden>
                in
              </span>
              <span>LinkedIn Profile</span>
            </a>
          </div>
        </div>
      </header>

      <div className="content">
        <section className="section">
          <h2 className="section-title">About Me</h2>
          <p className="about-text">{ABOUT_TEXT}</p>
        </section>

        <section className="section">
          <h2 className="section-title">Technical Skills</h2>
          <div className="skills-grid">
            {SKILLS.map((skill) => (
              <div key={skill} className="skill-badge">
                {skill}
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Professional Experience</h2>
          {EXPERIENCE.map((job) => (
            <div key={job.company} className="job">
              <div className="job-header">
                <div>
                  <span className="job-company">{job.company}</span>
                  <span className="job-title">{job.role}</span>
                </div>
                <span className="job-dates">{job.dates}</span>
              </div>
              <div className="job-description">
                <ul>
                  {job.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        <section className="section">
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-container">
            {PROJECTS.map((project) => (
              <div key={project.href} className="project-card">
                <a
                  href={project.href}
                  className="project-url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.label}
                </a>
                <p className="project-blurb">{project.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Education</h2>
          <div className="education-item">
            <div className="degree">{EDUCATION.degree}</div>
            <div className="school">{EDUCATION.school}</div>
            <div className="study-period">{EDUCATION.period}</div>
          </div>
        </section>
      </div>

      <footer className="footer">
        <p>
          © 2026 Artur Babloyan | Senior Frontend Developer | Available for opportunities in
          international companies
        </p>
      </footer>
    </div>
  );
}
