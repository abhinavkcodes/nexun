# Nexun — AI Resume Intelligence Platform

Nexun is an AI-powered resume analysis platform that helps job seekers understand how their resume performs against Applicant Tracking Systems (ATS) and real recruiter expectations. Upload a PDF resume and get an instant, detailed breakdown of ATS compatibility, role match, experience quality, project depth, keyword coverage, and actionable improvement suggestions.

## ✨ Features

- **ATS Compatibility Score** — Detects formatting issues, missing sections, and parsing risks that could get a resume auto-rejected by ATS software.
- **Role Detection & Match Scoring** — Automatically detects the most likely target role (Frontend Developer, Backend Developer, Data Scientist, AI Engineer, DevOps Engineer, and more) and scores how well the resume aligns with required and preferred skills for that role.
- **Experience Analysis** — Evaluates action verbs, quantified metrics, leadership signals, relevance, and formatting consistency in the experience section.
- **Project Analysis** — Assesses technical depth, deployment evidence, measurable impact, and architectural complexity of listed projects.
- **Keyword Coverage Panel** — Highlights which industry-relevant keywords appear in the resume and which are missing.
- **Skill Gap Detection** — Surfaces missing required/preferred skills for the detected role, prioritized by importance.
- **STAR Suggestions** — Provides actionable, expandable suggestions for improving bullet points using the STAR (Situation, Task, Action, Result) method.
- **Section Health Breakdown** — Scores each resume section (Summary, Skills, Experience, Projects, Education, Certifications, Achievements, Leadership) individually.
- **Resume Strength & Percentile Estimate** — Gives an overall strength label (Weak → Excellent) and an estimated percentile ranking.
- **PDF-Tolerant Parsing** — Readability and consistency scoring includes fallbacks for PDFs that strip bullet characters during text extraction.
- **Resume Improver (Non-Fabricating)** — Suggests safe, structural improvements (e.g., adding missing skills, GitHub links, date ranges) without ever inventing fake achievements or metrics.

## 🏗️ Tech Stack

- **Framework:** Next.js (App Router) with TypeScript
- **Frontend:** React, Tailwind CSS, Lucide Icons
- **Authentication:** Supabase Auth
- **Database/ORM:** Prisma + PostgreSQL (via Supabase or any Postgres provider)
- **PDF Parsing:** `pdf-parse`
- **Styling:** Custom CSS + Tailwind utility classes

## 📁 Project Structure

```
.
├── app/
│   ├── api/
│   │   └── parse-resume/
│   │       └── route.ts          # Main API endpoint — runs the full analysis pipeline
│   ├── analysis/                  # Analysis results page
│   └── page.tsx                   # Landing page
├── components/
│   ├── AnalysisDashboard.tsx      # Main results dashboard
│   ├── ATSScoreCard.tsx           # ATS score widget
│   ├── ExperienceScoreCard.tsx    # Experience match widget
│   ├── SkillGapCard.tsx           # Missing skills widget
│   ├── StarSuggestionsCard.tsx    # Expandable improvement tips
│   ├── UploadResume.tsx           # Resume upload UI
│   ├── Navbar.tsx                 # Site navigation + auth state
│   └── footer.tsx                 # Site footer
└── lib/
    ├── analyzer.ts                 # Role match & keyword density scoring
    ├── atsEngine.ts                # Aggregates all sub-scores into overall ATS result
    ├── atsCompliance.ts            # ATS formatting/compliance checks
    ├── resumeIntelligence.ts       # Contact info, readability, word/page counts
    ├── experienceAnalyzer.ts       # Experience section scoring
    ├── projectAnalyzer.ts          # Projects section scoring
    ├── resumeImprover.ts           # Safe, non-fabricating resume improvements
    ├── pdf.ts                      # PDF text extraction
    ├── prisma.ts                   # Prisma client singleton
    └── auth.ts                     # Supabase auth helper
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (e.g., via [Supabase](https://supabase.com))
- A Supabase project for authentication

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/nexun.git
   cd nexun
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables. Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧠 How It Works

1. **Upload** — The user uploads a PDF resume via the landing page or upload component.
2. **Extraction** — `pdf.ts` extracts raw text from the PDF using `pdf-parse`.
3. **Role Detection** — `roleDetector` identifies the most likely target role based on resume content.
4. **Multi-Stage Analysis** — The pipeline runs in parallel across several modules:
   - `analyzer.ts` — role match & keyword density
   - `experienceAnalyzer.ts` — experience quality scoring
   - `projectAnalyzer.ts` — project quality scoring
   - `resumeIntelligence.ts` — contact info, readability, ATS risk flags
   - `sectionAnalyzer` — per-section health checks
5. **Aggregation** — `atsEngine.ts` combines all sub-scores into a single overall score and recruiter-facing summary.
6. **Storage** — Results are persisted via Prisma to the database for later retrieval.
7. **Dashboard** — `AnalysisDashboard.tsx` renders the full breakdown with interactive score cards, skill gaps, and STAR suggestions.

## 📊 Supported Roles

The role matching engine currently supports profiles for:

- Frontend Developer
- Backend Developer
- Full Stack Developer
- Data Scientist
- AI Engineer
- Software Engineer
- Data Analyst
- DevOps Engineer
- Machine Learning Engineer

Each profile defines required and preferred skills, which are matched against the resume using an extensive alias dictionary (e.g., "JS", "ES6", and "ECMAScript" all map to "JavaScript").

## 🔒 Authentication

Nexun uses Supabase Auth for user sign-in. Logged-in users see a profile dropdown with their email and a logout option; logged-out users see a "Log In" link. Analysis can currently be performed without an account (resumes are saved under an `anonymous` user ID).

## 🛣️ Roadmap

- [ ] Connect resume analyses to authenticated user accounts
- [ ] AI-generated bullet point rewriting (with user review)
- [ ] Support for DOCX resume uploads
- [ ] Expanded role profile database
- [ ] Resume version history and comparison

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request with a clear description of your changes.

## 📄 License

This project is licensed under the MIT License.

---

