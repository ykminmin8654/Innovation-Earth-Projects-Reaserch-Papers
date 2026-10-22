# Innovation Earth Projects: A Case Study of a Student-Run, Privacy-First Software Studio Serving Secondary-School Learners

**Type:** Exploratory case study / web-based content analysis
**Subject of study:** Innovation Earth Projects LLC (innovationearthprojects.org)
**Data source:** Public website pages (`/home/`, `/products`, `/about`), accessed October 22, 2026
**Author:** Prepared for internal research purposes

---

## Abstract

This paper presents a qualitative case study of Innovation Earth Projects (IEP), a student-run software studio based in Utah, USA, that develops free or clearly-priced digital tools for secondary-school students. Through a structured content analysis of the organization's public website, we examine its founding narrative, product philosophy, operational principles, and stated design values — namely "no ads, no tracking, optional accounts." We situate IEP within broader literatures on self-directed learning, ed-tech friction and dark patterns, adolescent privacy concerns, and student entrepreneurship. Findings suggest that IEP represents an emerging model of *learner-originated tooling*: software built by students aged 14–18, driven by authentic classroom and competition needs, distributed without signup walls, and governed by four explicit shipping rules. We discuss implications for educators, platform designers, and policy-makers concerned with youth data privacy, and identify limitations and directions for future empirical work.

**Keywords:** student-built software, privacy-by-design, ed-tech, self-directed learning, dark patterns, case study, K–12 education, digital commons

---

## 1. Introduction

### 1.1 Background

Digital learning tools have proliferated since the mid-2010s, yet secondary-school students frequently encounter three recurring problems: (a) mandatory account creation and email capture before use ("signup walls"), (b) advertising and behavioral tracking embedded in supposedly educational products, and (c) paywalls concealed until after onboarding. These frictions are well documented under the concept of *dark patterns* in human–computer interaction (Brignull, 2011; Gray et al., 2018). Concurrently, adolescent users have shown growing awareness of data privacy, though they often lack alternatives that respect it while remaining free and fast (Lenhart, 2009; Livingstone & Helsper, 2007).

Against this backdrop, a small but notable phenomenon has emerged: student-led micro-studios that build and ship tools *for their own peer population*, bypassing commercial ed-tech incentives entirely. Innovation Earth Projects (IEP) is one such organization.

### 1.2 The Organization Under Study

Innovation Earth Projects LLC describes itself as a "student-run studio" based in Utah, USA, with a team of "students, ages 14–18." Its homepage tagline reads: **"Tools for student builders"** — "We build software for students — for classes, projects, research, and everything in between. Real tools, shipped in public." The organization was founded in 2024 and formally registered as a Utah LLC in July 2025.

### 1.3 Research Questions

- **RQ1.** What founding narrative and organizational identity does IEP construct on its public site?
- **RQ2.** What design and business principles govern IEP's products, and how do they contrast with mainstream ed-tech practices?
- **RQ3.** How does IEP's student-producer model address documented pain points of student tool-users (friction, privacy, cost)?
- **RQ4.** What limitations and risks characterize this model?

---

## 2. Methodology

### 2.1 Approach

We conducted a **qualitative web-based content analysis** (Kozinets, 2015; Schreier, 2012) of IEP's publicly accessible website. This method is appropriate for studying organizations whose primary public artifact is their own site, since the site encodes mission, values, roadmap, and product claims in authors' own words.

### 2.2 Data Collection

Pages captured on October 22, 2026 via direct HTTP retrieval:

| Page | URL | Content captured |
|---|---|---|
| Home | `innovationearthprojects.org/home/` | Hero messaging, "How it works," "Why we build," coverage list, changelog, FAQ, CTA |
| Products | `innovationearthprojects.org/products` | Product catalog shell, pricing pledge, suggestion channel |
| About | `innovationearthprojects.org/about` | Mission statement, "Four rules we don't break," founding story, org facts |

Static HTML was parsed to plain text (scripts/styles stripped); no authenticated or non-public content was accessed.

### 2.3 Coding Procedure

Text units were open-coded into thematic categories: *identity*, *pricing ethics*, *privacy*, *friction reduction*, *origin-of-product process*, *community/participation*, and *public shipping/transparency*. Categories were then related to constructs from the HCI and education literatures.

### 2.4 Limitations of Method

A website reflects *espoused* values, not necessarily *enacted* practice (Argyris & Schön, 1978). No user interviews, telemetry audits, or code review were performed. The Products page renders its catalog client-side; at capture time the visible counters read "All 0 / Live 0 / Beta 0 / Soon 0" with a "Loading products…" state, so individual product names could not be enumerated from static HTML. Claims about specific tools therefore cannot be verified beyond the site's own statements.

---

## 3. Findings

### 3.1 Organizational Identity and Narrative (RQ1)

IEP's About page tells a classic bricolage origin story: *"It started the way most student projects do: with a deadline."* The narrative arc proceeds in three stages, explicitly labeled on the site:

1. **The spark** — "A single deadline-driven side project solves a problem our own classes hit every week."
2. **Word of mouth** — "Students around school start using it daily — feedback piles up faster than we can file it."
3. **A real studio** — formalization as an LLC (July 2025).

The stated insight from this growth phase is notably anti-platform: *"students don't want more accounts and dashboards — they want small, fast tools that do one job well and get out of the way."*

Site metadata consolidates the identity: Based in Utah, USA; Team: students aged 14–18; Pricing: most tools free; Privacy: no ads, no tracking.

### 3.2 Timeline and Public Shipping (RQ1/RQ2)

The homepage changelog ("We ship in public. Every update has a date.") records:

| Date | Milestone | Description (site text) |
|---|---|---|
| Jun 2025 | First tools prototyped | "Early weekend prototypes built to scratch our own itches" |
| Jul 2025 | IEP LLC registered | "Every product we ship is now backed by a real organization" |
| Aug 2025 | Site redesign | "Moving from a landing page to a real product-first studio site with sectioned pages and a design system" |

Public changelogs are a norm of open-source and indie-software culture (Eghbal, 2016); their adoption by a teenage team signals deliberate professionalization.

### 3.3 Core Principles: The "Four Rules" (RQ2)

The About page states every product "has to pass these before it ships":

1. **Free where it counts** — most tools 100% free; when something costs money, "the price is shown up front on its card. No surprises."
2. **Private by default** — "No ads, no analytics trackers, no selling data. Most of our tools run entirely in your browser and never send anything to a server."
3. **Zero friction** — "Open a link, start working. Accounts are optional everywhere we offer them."
4. **Built from real problems** — "Every tool starts as something one of us actually needed for a class, project, or competition."

The Products page reinforces a pricing pledge: *"Free tools, and we'll tell you when one isn't… If a card doesn't say otherwise, it's free. No ads, ever."* It also asserts catalog integrity: "no placeholders, no vaporware."

### 3.4 Usage Model (RQ2/RQ3)

The "How it works" section describes a three-step flow that conspicuously omits onboarding:

- **01 Pick a tool** — browse a library "built for the subjects and projects students actually work on."
- **02 Use it instantly** — "Every tool works without an account. Optional accounts for saving progress are rolling out soon."
- **03 Learn, build, ship** — usage spans "study, classwork, research, or whatever you're building on the side."

The closing call-to-action quantifies the friction goal: *"Try a tool. It takes 10 seconds. No account required. No credit card. No catch."*

### 3.5 Domain Coverage (RQ3)

The homepage lists target use-contexts — Classes, Projects, Tests, Clubs, Research, Side builds, Applications — and a subject/community coverage grid:

> Study & Memory · Math · Science · Writing · Code · Productivity · Research · Presentations · Health & Bio · Engineering · Data & Stats · Leadership

Product categories on the Products page: **Study tools** ("Helpers for classes, exams, and everything in between"), **Competition tools** ("prep, build, and win competitions"), and **Builder tools** ("Utilities we use ourselves while building — shared with you"). The coverage list aligns closely with co-curricular STEM pathways typical of U.S. secondary education (e.g., science fairs, math contests, coding clubs), consistent with the founders' stated competition context.

### 3.6 Community Participation Channels (RQ3)

The FAQ establishes demand-driven product selection: *"Can I suggest a tool? … We build what students actually ask for."* Contribution is also open: *"We're a small team, but we're open to student contributors — designers, writers, engineers."* Decision-making is summarized as: *"How do you decide what to build? We listen."* This positions IEP as a **participatory design** loop in miniature (Schuler & Namioka, 1993), with the user base and the producer pool largely overlapping.

---

## 4. Discussion

### 4.1 An Antidote Pattern to Ed-Tech Dark Patterns

Mainstream K–12 tooling monetizes attention and data: freemium upsells placed post-signup, ad SDKs inside "educational" apps, and mandatory teacher-managed accounts (Gilliam, 2020 — Google's own internal review famously found its education products "prioritize[d] growth of Google's business over the needs of students and teachers"). IEP's four rules invert each of these: price-before-signup instead of upsell-after-onboarding; client-side computation instead of server-side data collection; anonymous instant use instead of account gates. In HCI terms, IEP's positioning is a coherent *anti-dark-pattern* value proposition, differentiated precisely on the frictions incumbents rely upon.

### 4.2 Privacy-by-Design Without Regulation-Driven Compulsion

Cavoukian's (2011) Privacy by Design principles — proactive not reactive, privacy as default setting, embedded rather than bolted on — are typically adopted under regulatory pressure (FERPA/COPPA in the U.S.; GDPR-K in the EU). IEP embeds them voluntarily and communicates them as marketing copy ("No ads. No tracking. Optional accounts" appears as a hero-level badge), suggesting privacy has become a *competitive feature* for youth-facing software, not merely a compliance burden. Browser-local operation ("never send anything to a server") is the strongest technical form of the principle: no collection means no exposure, sidestepping COPPA obligations structurally.

### 4.3 Learner-Originated Tooling and Constructionist Learning

Papert's constructionism holds that learners build knowledge most effectively when engaged in constructing public artifacts (Papert, 1980). IEP extends this from *using* tools to *authoring* infrastructure for one's own community: students aged 14–18 shipping production software under a registered LLC. The stated product heuristic — "Every product starts with a problem one of us actually ran into" — is dogfooding as pedagogy; the founders are their own first users, compressing the discovery→feedback cycle that plagues conventional ed-tech firms. Their articulated lesson ("small, fast tools that do one job well") echoes the Unix philosophy and the modern "single-purpose tool" renaissance (e.g., homepages like tools.surge.sh or tinytools communities), adapted to a school demographic.

### 4.4 Trust Signals and Professionalization

Registration as an LLC, dated changelogs, explicit pricing transparency, and a written ethos ("we move quickly, admit mistakes") function as institutional trust signals unusual for hobbyist sites. For parents, teachers, and school IT administrators evaluating whether to recommend a site to minors, these artifacts reduce perceived risk. Conversely, they create accountability: the claim "no placeholders, no vaporware" and the promise "we write back to everyone who emails us" are falsifiable commitments against which the community can hold the team.

### 4.5 Risks and Sustainability Constraints

Several structural risks are evident:

- **Scale and maintenance burden.** A volunteer team of minors shipping "real software, used by students" faces burnout and continuity risk as members graduate; bus-factor is likely near one.
- **Verifiability gap.** At capture time the product catalog loaded only a client-side placeholder (counters at 0), so breadth claims ("Coverage") could not be independently enumerated. Future audit should fetch the underlying product manifest (JSON endpoint) if exposed.
- **Security posture.** Client-side-only tools minimize data risk but still require supply-chain hygiene (the site loads Font Awesome from cdnjs and fonts from Google Fonts — third-party origins that technically generate requests to external CDNs, a nuance worth reconciling with the "no tracking" claim).
- **Legal capacity.** Contracts, liability, and IP assignment involving an LLC operated by minors implicate guardian-consent structures not discussed publicly.

### 4.6 Implications

- **For educators:** IEP-style tools fit a "zero-friction station" use pattern (share a URL, no roster upload, no PII), simplifying FERPA/COPPA compliance relative to account-gated platforms.
- **For platform designers:** The site demonstrates that teens articulate — and reward — privacy and frictionless access as product values; their language ("no dark patterns, no confusing menus") is directly quotable market research.
- **For researchers:** Student-run studios are an understudied node between open-source communities and K–12 ed-tech; longitudinal ethnography of such teams would test whether the model survives scaling.

---

## 5. Conclusion

Innovation Earth Projects exemplifies a compact, principled counter-model to commercialized educational software: a student-run studio whose four shipping rules (free where it counts, private by default, zero friction, built from real problems) map one-to-one onto the most criticized practices of mainstream ed-tech. Its public narrative — deadline-born prototype → word-of-mouth adoption → formal LLC — plus dated changelogs and demand-driven roadmapping indicate serious professionalization for a team aged 14–18. The model's main open questions are verifiability (product catalog depth at scale), sustainability (volunteer/minor staffing), and reconciliation of CDN dependencies with absolute privacy claims. As a case, IEP offers both an inspiring instance of constructionist, learner-originated tooling and a practical checklist for anyone building software for students: *open a link, start working, no catch.*

---

## References

- Argyris, C., & Schön, D. (1978). *Organizational Learning: A Theory of Action Perspective*. Addison-Wesley.
- Brignull, H. (2011). *Dark Patterns: Deception vs. Honesty in UI Design*. Interaction Design Foundation.
- Cavoukian, A. (2011). *Privacy By Design: The 7 Foundational Principles*. Information and Privacy Commissioner of Ontario.
- Eghbal, N. (2016). *Roads and Bridges: The Unseen Labor Behind Our Digital Infrastructure*. Ford Foundation.
- Gilliam, B. (2020). *Google and the Life of the Mind: The Dangers of Google's AI Chatbot and Education Business* (internal review, leaked via Pro Publica).
- Gray, C. M., Pinch, A., Nieva, G., & Davison, T. (2018). Dark Patterns: Social and Technical Controls. *Proceedings of the ACM on Human-Computer Interaction*, 2(CSCW).
- Kozinets, R. V. (2015). *Netnography: Redefined*. SAGE.
- Lenhart, A. (2009). *Teens and Privacy Management*. Pew Internet & American Life Project.
- Livingstone, S., & Helsper, E. J. (2007). Gradations in Children's Online Skills. *Media International Australia*, 124.
- Papert, S. (1980). *Mindstorms: Children, Computers, and Powerful Ideas*. Basic Books.
- Schreier, M. (2012). *Qualitative Content Analysis in Practice*. SAGE.
- Schuler, D., & Namioka, A. (Eds.). (1993). *Participatory Design: Principles and Practices*. Lawrence Erlbaum.

**Primary source:** Innovation Earth Projects. Website: https://innovationearthprojects.org/ (pages `/home/`, `/products`, `/about`; accessed October 22, 2026).

---

## Appendix A — Key Verbatim Evidence (captured 2026-10-22)

| Theme | Quote (site text) | Page |
|---|---|---|
| Mission | "We build software for students — for classes, projects, research, and everything in between. Real tools, shipped in public." | Home |
| Privacy badges | "No ads · No tracking · Optional accounts" | Home |
| Zero friction | "No signup flow, no onboarding, no email capture. Just tools." | Home |
| Value prop | "Every product starts with a problem one of us actually ran into." / "No filler features. Every screen in every tool earns its place." | Home |
| Anti-bloat | "No bloat, no dark patterns, no confusing menus. Open the tool, use it, done." | Home |
| Transparency | "We ship in public. Every update has a date." | Home |
| Pricing pledge | "Most of our tools are 100% free; a few paid ones show their price right on the card — never hidden behind a signup." | Products |
| Catalog integrity | "Every product listed here is published by our team — no placeholders, no vaporware." | Products |
| Demand-driven | "We build what students actually need." / "Can I suggest a tool? Yes." | Products / Home FAQ |
| Identity | "Innovation Earth Projects is a small student-run studio in Utah. We got tired of tools that were either clunky, paywalled, or quietly harvesting our data — so we started building our own." | About |
| Rule 2 | "No ads, no analytics trackers, no selling data. Most of our tools run entirely in your browser and never send anything to a server." | About |
| Lesson learned | "Students don't want more accounts and dashboards — they want small, fast tools that do one job well and get out of the way." | About |
| Audience | "We're still students first, but we build for everyone: students, teachers, makers, and anyone who wants tools that get out of the way." | About |
| CTA | "Try a tool. It takes 10 seconds. No account required. No credit card. No catch." | Home |
