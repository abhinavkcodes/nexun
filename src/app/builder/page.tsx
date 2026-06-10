"use client";

import { useState, useRef } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const emptyExperience = (): WorkExperience => ({
  id: uid(),
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

const emptyEducation = (): Education => ({
  id: uid(),
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  gpa: "",
});

const INITIAL: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
  summary: "",
  skills: [],
  experience: [emptyExperience()],
  education: [emptyEducation()],
};

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-card">
      <h2 className="section-title">
        <span className="section-icon">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function completeness(data: ResumeData): number {
  const checks = [
    !!data.fullName,
    !!data.email,
    !!data.phone,
    !!data.location,
    !!data.summary,
    data.skills.length > 0,
    data.experience.some((e) => e.company && e.role),
    data.education.some((e) => e.institution && e.degree),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ── Preview ───────────────────────────────────────────────────────────────────

function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div className="preview-paper">
      {/* Header */}
      <div className="preview-header">
        <h1 className="preview-name">{data.fullName || "Your Name"}</h1>
        <div className="preview-contact">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
          {data.website && <span>{data.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="preview-section">
          <div className="preview-section-title">Professional Summary</div>
          <p className="preview-text">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.some((e) => e.company) && (
        <div className="preview-section">
          <div className="preview-section-title">Work Experience</div>
          {data.experience.map((exp) =>
            exp.company ? (
              <div key={exp.id} className="preview-item">
                <div className="preview-item-header">
                  <strong>{exp.role}</strong>
                  <span className="preview-date">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <div className="preview-item-sub">{exp.company}</div>
                {exp.description && (
                  <p className="preview-text preview-desc">{exp.description}</p>
                )}
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Education */}
      {data.education.some((e) => e.institution) && (
        <div className="preview-section">
          <div className="preview-section-title">Education</div>
          {data.education.map((edu) =>
            edu.institution ? (
              <div key={edu.id} className="preview-item">
                <div className="preview-item-header">
                  <strong>
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </strong>
                  <span className="preview-date">
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <div className="preview-item-sub">
                  {edu.institution}
                  {edu.gpa && ` · GPA: ${edu.gpa}`}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="preview-section">
          <div className="preview-section-title">Skills</div>
          <div className="preview-skills">
            {data.skills.map((s) => (
              <span key={s} className="preview-skill-tag">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BuilderPage() {
  const [data, setData] = useState<ResumeData>(INITIAL);
  const [skillInput, setSkillInput] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saved, setSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // ── Update helpers ──────────────────────────────────────────────────────────

  const set = (field: keyof ResumeData, value: unknown) =>
    setData((d) => ({ ...d, [field]: value }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !data.skills.includes(s)) {
      set("skills", [...data.skills, s]);
    }
    setSkillInput("");
  };

  const removeSkill = (s: string) =>
    set(
      "skills",
      data.skills.filter((x) => x !== s)
    );

  const updateExp = (id: string, field: keyof WorkExperience, val: unknown) =>
    set(
      "experience",
      data.experience.map((e) => (e.id === id ? { ...e, [field]: val } : e))
    );

  const addExp = () => set("experience", [...data.experience, emptyExperience()]);
  const removeExp = (id: string) =>
    set(
      "experience",
      data.experience.filter((e) => e.id !== id)
    );

  const updateEdu = (id: string, field: keyof Education, val: unknown) =>
    set(
      "education",
      data.education.map((e) => (e.id === id ? { ...e, [field]: val } : e))
    );

  const addEdu = () => set("education", [...data.education, emptyEducation()]);
  const removeEdu = (id: string) =>
    set(
      "education",
      data.education.filter((e) => e.id !== id)
    );

  // ── Save / export ───────────────────────────────────────────────────────────

  const handleSave = () => {
    localStorage.setItem("nexun_resume_builder", JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePrint = () => window.print();

  const pct = completeness(data);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        /* ── Reset & base ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:       #0d0f14;
          --surface:  #13161e;
          --card:     #181c27;
          --border:   #252a38;
          --accent:   #4f8aff;
          --accent2:  #7c5cfc;
          --green:    #30d97f;
          --red:      #ff4f6a;
          --text:     #e8ecf4;
          --muted:    #7a8299;
          --radius:   12px;
        }

        body { background: var(--bg); color: var(--text); font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        /* ── Layout ── */
        .builder-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── Top bar ── */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          height: 60px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .topbar-brand {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.4px;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .topbar-actions { display: flex; gap: 10px; align-items: center; }
        .tab-group { display: flex; gap: 4px; background: var(--bg); border-radius: 8px; padding: 3px; }
        .tab-btn {
          padding: 5px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          background: transparent;
          color: var(--muted);
        }
        .tab-btn.active { background: var(--card); color: var(--text); }

        .btn {
          padding: 7px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: opacity 0.18s, transform 0.12s;
        }
        .btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .btn-primary { background: var(--accent); color: #fff; }
        .btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); }
        .btn-saved { background: var(--green); color: #0d0f14; }

        /* ── Content area ── */
        .content-area {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          padding: 28px 24px;
        }
        .editor-col { padding-right: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .preview-col { padding-left: 16px; position: sticky; top: 88px; height: calc(100vh - 88px); overflow-y: auto; }

        /* Mobile: single column with tabs */
        @media (max-width: 900px) {
          .content-area { grid-template-columns: 1fr; padding: 16px; }
          .editor-col { padding-right: 0; display: ${activeTab === "edit" ? "flex" : "none"}; }
          .preview-col { padding-left: 0; position: static; height: auto; display: ${activeTab === "preview" ? "block" : "none"}; }
        }

        /* ── Progress ── */
        .progress-wrap {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px;
          background: var(--card);
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
        .progress-label { font-size: 13px; color: var(--muted); white-space: nowrap; }
        .progress-bar { flex: 1; height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          transition: width 0.4s ease;
        }
        .progress-pct { font-size: 13px; font-weight: 700; color: var(--accent); min-width: 36px; text-align: right; }

        /* ── Section card ── */
        .section-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-icon { font-size: 16px; }

        /* ── Grid row ── */
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

        /* ── Field ── */
        .field-group { display: flex; flex-direction: column; gap: 5px; }
        .field-label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .field-input, .field-textarea {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 14px;
          padding: 8px 12px;
          transition: border-color 0.18s;
          outline: none;
          font-family: inherit;
          resize: vertical;
        }
        .field-input:focus, .field-textarea:focus { border-color: var(--accent); }

        /* ── Skills ── */
        .skills-input-row { display: flex; gap: 8px; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-chip {
          display: flex; align-items: center; gap: 6px;
          background: rgba(79,138,255,0.12);
          border: 1px solid rgba(79,138,255,0.28);
          border-radius: 99px;
          padding: 4px 12px;
          font-size: 13px;
          color: var(--accent);
        }
        .skill-chip button {
          background: none; border: none; cursor: pointer;
          color: var(--muted); font-size: 14px; line-height: 1;
          padding: 0;
          transition: color 0.15s;
        }
        .skill-chip button:hover { color: var(--red); }

        /* ── Entry card ── */
        .entry-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .entry-header { display: flex; justify-content: space-between; align-items: center; }
        .entry-label { font-size: 13px; font-weight: 600; color: var(--muted); }
        .remove-btn {
          background: rgba(255,79,106,0.1);
          border: 1px solid rgba(255,79,106,0.2);
          color: var(--red);
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .remove-btn:hover { background: rgba(255,79,106,0.2); }

        .add-btn {
          width: 100%;
          padding: 10px;
          background: transparent;
          border: 1px dashed var(--border);
          border-radius: 10px;
          color: var(--muted);
          font-size: 13px;
          cursor: pointer;
          transition: border-color 0.18s, color 0.18s;
        }
        .add-btn:hover { border-color: var(--accent); color: var(--accent); }

        .checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
        .checkbox-row input { accent-color: var(--accent); width: 15px; height: 15px; cursor: pointer; }

        /* ── Preview ── */
        .preview-paper {
          background: #fff;
          color: #1a1a2e;
          border-radius: var(--radius);
          padding: 36px 40px;
          min-height: 800px;
          font-family: 'Georgia', serif;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
          font-size: 13px;
          line-height: 1.6;
        }
        .preview-header { border-bottom: 2px solid #1a1a2e; padding-bottom: 12px; margin-bottom: 16px; }
        .preview-name { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; color: #1a1a2e; font-family: 'Georgia', serif; }
        .preview-contact { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 6px; font-size: 12px; color: #444; }
        .preview-section { margin-bottom: 16px; }
        .preview-section-title {
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
          color: #333; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px;
        }
        .preview-item { margin-bottom: 12px; }
        .preview-item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .preview-item-header strong { font-size: 13.5px; color: #1a1a2e; }
        .preview-date { font-size: 11.5px; color: #666; }
        .preview-item-sub { font-size: 12px; color: #555; margin-top: 1px; }
        .preview-text { font-size: 12.5px; color: #333; margin-top: 4px; }
        .preview-desc { white-space: pre-wrap; }
        .preview-skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .preview-skill-tag {
          background: #f0f0f0; color: #333; border-radius: 4px;
          padding: 2px 10px; font-size: 12px; font-family: sans-serif;
        }

        /* ── Print ── */
        @media print {
          .topbar, .editor-col, .progress-wrap { display: none !important; }
          .content-area { display: block; padding: 0; }
          .preview-col { position: static; height: auto; padding: 0; }
          .preview-paper { box-shadow: none; border-radius: 0; }
        }
      `}</style>

      <div className="builder-root">
        {/* Top bar */}
        <header className="topbar">
          <span className="topbar-brand">✦ Resume Builder</span>
          <div className="topbar-actions">
            {/* Tab toggle on mobile */}
            <div className="tab-group">
              <button
                className={`tab-btn ${activeTab === "edit" ? "active" : ""}`}
                onClick={() => setActiveTab("edit")}
              >
                Edit
              </button>
              <button
                className={`tab-btn ${activeTab === "preview" ? "active" : ""}`}
                onClick={() => setActiveTab("preview")}
              >
                Preview
              </button>
            </div>
            <button
              className={`btn ${saved ? "btn-saved" : "btn-outline"}`}
              onClick={handleSave}
            >
              {saved ? "✓ Saved" : "Save"}
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              Export PDF
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="content-area">
          {/* ── EDITOR ── */}
          <div className="editor-col">
            {/* Progress */}
            <div className="progress-wrap">
              <span className="progress-label">Profile completeness</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="progress-pct">{pct}%</span>
            </div>

            {/* Personal info */}
            <Section title="Personal Information" icon="👤">
              <div className="row2">
                <Field label="Full Name">
                  <input
                    className="field-input"
                    value={data.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Jane Doe"
                  />
                </Field>
                <Field label="Email">
                  <input
                    className="field-input"
                    type="email"
                    value={data.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="jane@example.com"
                  />
                </Field>
              </div>
              <div className="row2">
                <Field label="Phone">
                  <input
                    className="field-input"
                    value={data.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+1 555 000 0000"
                  />
                </Field>
                <Field label="Location">
                  <input
                    className="field-input"
                    value={data.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="New York, NY"
                  />
                </Field>
              </div>
              <div className="row2">
                <Field label="LinkedIn URL">
                  <input
                    className="field-input"
                    value={data.linkedin}
                    onChange={(e) => set("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/janedoe"
                  />
                </Field>
                <Field label="Website / Portfolio">
                  <input
                    className="field-input"
                    value={data.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="janedoe.dev"
                  />
                </Field>
              </div>
            </Section>

            {/* Summary */}
            <Section title="Professional Summary" icon="📝">
              <Field label="Summary">
                <textarea
                  className="field-textarea"
                  rows={4}
                  value={data.summary}
                  onChange={(e) => set("summary", e.target.value)}
                  placeholder="A brief, compelling overview of your professional background, key skills, and career goals..."
                />
              </Field>
            </Section>

            {/* Skills */}
            <Section title="Skills" icon="⚡">
              <div className="skills-input-row">
                <input
                  className="field-input"
                  style={{ flex: 1 }}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Type a skill and press Enter"
                />
                <button className="btn btn-primary" onClick={addSkill}>
                  Add
                </button>
              </div>
              {data.skills.length > 0 && (
                <div className="skills-list">
                  {data.skills.map((s) => (
                    <span key={s} className="skill-chip">
                      {s}
                      <button onClick={() => removeSkill(s)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </Section>

            {/* Work Experience */}
            <Section title="Work Experience" icon="💼">
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-label">Position {i + 1}</span>
                    {data.experience.length > 1 && (
                      <button
                        className="remove-btn"
                        onClick={() => removeExp(exp.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="row2">
                    <Field label="Job Title">
                      <input
                        className="field-input"
                        value={exp.role}
                        onChange={(e) => updateExp(exp.id, "role", e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </Field>
                    <Field label="Company">
                      <input
                        className="field-input"
                        value={exp.company}
                        onChange={(e) =>
                          updateExp(exp.id, "company", e.target.value)
                        }
                        placeholder="Acme Corp"
                      />
                    </Field>
                  </div>
                  <div className="row2">
                    <Field label="Start Date">
                      <input
                        className="field-input"
                        value={exp.startDate}
                        onChange={(e) =>
                          updateExp(exp.id, "startDate", e.target.value)
                        }
                        placeholder="Jan 2022"
                      />
                    </Field>
                    <Field label="End Date">
                      <input
                        className="field-input"
                        value={exp.endDate}
                        onChange={(e) =>
                          updateExp(exp.id, "endDate", e.target.value)
                        }
                        placeholder="Dec 2023"
                        disabled={exp.current}
                      />
                    </Field>
                  </div>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) =>
                        updateExp(exp.id, "current", e.target.checked)
                      }
                    />
                    Currently working here
                  </label>
                  <Field label="Description / Achievements">
                    <textarea
                      className="field-textarea"
                      rows={3}
                      value={exp.description}
                      onChange={(e) =>
                        updateExp(exp.id, "description", e.target.value)
                      }
                      placeholder="• Led a team of 5 engineers to deliver...&#10;• Improved performance by 40% through..."
                    />
                  </Field>
                </div>
              ))}
              <button className="add-btn" onClick={addExp}>
                + Add another position
              </button>
            </Section>

            {/* Education */}
            <Section title="Education" icon="🎓">
              {data.education.map((edu, i) => (
                <div key={edu.id} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-label">Degree {i + 1}</span>
                    {data.education.length > 1 && (
                      <button
                        className="remove-btn"
                        onClick={() => removeEdu(edu.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="row2">
                    <Field label="Institution">
                      <input
                        className="field-input"
                        value={edu.institution}
                        onChange={(e) =>
                          updateEdu(edu.id, "institution", e.target.value)
                        }
                        placeholder="MIT"
                      />
                    </Field>
                    <Field label="Degree">
                      <input
                        className="field-input"
                        value={edu.degree}
                        onChange={(e) =>
                          updateEdu(edu.id, "degree", e.target.value)
                        }
                        placeholder="B.Sc."
                      />
                    </Field>
                  </div>
                  <div className="row3">
                    <Field label="Field of Study">
                      <input
                        className="field-input"
                        value={edu.field}
                        onChange={(e) =>
                          updateEdu(edu.id, "field", e.target.value)
                        }
                        placeholder="Computer Science"
                      />
                    </Field>
                    <Field label="Start Year">
                      <input
                        className="field-input"
                        value={edu.startDate}
                        onChange={(e) =>
                          updateEdu(edu.id, "startDate", e.target.value)
                        }
                        placeholder="2018"
                      />
                    </Field>
                    <Field label="End Year">
                      <input
                        className="field-input"
                        value={edu.endDate}
                        onChange={(e) =>
                          updateEdu(edu.id, "endDate", e.target.value)
                        }
                        placeholder="2022"
                      />
                    </Field>
                  </div>
                  <Field label="GPA (optional)">
                    <input
                      className="field-input"
                      value={edu.gpa}
                      onChange={(e) => updateEdu(edu.id, "gpa", e.target.value)}
                      placeholder="3.8 / 4.0"
                    />
                  </Field>
                </div>
              ))}
              <button className="add-btn" onClick={addEdu}>
                + Add another degree
              </button>
            </Section>
          </div>

          {/* ── PREVIEW ── */}
          <div className="preview-col" ref={printRef}>
            <ResumePreview data={data} />
          </div>
        </main>
      </div>
    </>
  );
}