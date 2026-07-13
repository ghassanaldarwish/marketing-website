You have access to:

- Live website: `https://ghassan.de`
- GitHub repository: `github.com/ghassanaldarwish/marketing-website`
- My private Notion database/board: **marketing-website**

Your goal is to understand the complete project and prepare the Notion board so I can later ask you to implement any ticket as real production code.

## 1. Understand the Notion board

First, learn how to use Notion professionally, including databases, board views, properties, templates, statuses, filters, and page content.

Open the private **marketing-website** database and study its structure before changing anything.

The workflow includes:

- Backlog
- Ready
- In Progress
- Code Review
- QA / Verification
- Blocked
- Done

Ticket properties include:

- Ticket
- Ticket ID
- Status
- Priority
- Source
- Milestone
- Labels
- Dependencies
- Order

There are two main ticket groups:

- `GH-*`: production bugs, content, design, responsive behavior, accessibility, SEO, localization, and release work.
- `ARC-*`: architecture, clean code, testing, CI, server/client boundaries, maintainability, security, and documentation.

Ticket bodies normally contain:

- Objective
- Context / Problem
- Scope
- Affected files
- Implementation notes
- Acceptance criteria
- QA checklist
- Out of scope
- Dependencies / Blockers

Do not change the board until you understand its structure, ticket conventions, dependencies, milestones, and current workflow.

## 2. Deeply analyze the GitHub repository

Inspect the latest version of:

`github.com/ghassanaldarwish/marketing-website`

Understand:

- Project architecture and folder structure
- Next.js routes and components
- Server and Client Component boundaries
- Localization and locale routing
- MDX article system
- Contact form and Telegram delivery
- Styling, themes, animations, and responsive behavior
- SEO, metadata, sitemap, hreflang, and structured data
- Testing, CI, configuration, deployment, and environment variables

Read the actual source code. Do not trust ticket descriptions without verification.

Run or inspect all available checks when possible:

- Formatting
- Lint
- Typecheck
- Unit tests
- E2E tests
- Production build

Use the latest source code as the main technical source of truth.

## 3. Test the live website

Crawl and test:

`https://ghassan.de`

Check all public pages and supported locales on desktop, tablet, and mobile.

Review:

- Navigation, links, buttons, forms, and article routes
- Light and dark themes
- Mobile menu and language switching
- Responsive layouts and horizontal overflow
- Typography, colors, spacing, and visual consistency
- Accessibility, keyboard use, focus states, landmarks, and headings
- Animations and reduced-motion behavior
- SEO, metadata, sitemap, hreflang, and structured data
- Broken links, console errors, wrong-language content, placeholders, and missing content
- Content quality and professional positioning

The website should represent me professionally as:

- Backend Developer
- DevOps Engineer
- Junior AI Developer

Evaluate it from the perspective of recruiters, engineering managers, developers, and potential clients.

When possible, determine whether the live website matches the latest GitHub version. Clearly distinguish between:

- Problems visible in production
- Problems found only in the source code
- Local changes that are not deployed
- Issues that require further runtime investigation

Do not describe a source-code issue as a live bug unless it is verified on the deployed website.

## 4. Verify every Notion ticket

For every ticket, determine whether it is:

- Confirmed
- Partially confirmed
- Not confirmed
- Already fixed
- Duplicate or overlapping
- Needs further investigation

Use concrete evidence:

- Exact file paths
- Relevant components, functions, or configuration
- Live website behavior
- Build, lint, test, or runtime results
- Related ticket IDs

Check whether the ticket’s problem, priority, scope, affected files, dependencies, acceptance criteria, status, and implementation order are accurate.

Be strict. Do not keep a ticket only because it already exists.

## 5. Align and simplify the board

After completing the initial analysis, update the Notion board.

You may:

- Edit tickets
- Create missing tickets for verified problems
- Remove outdated, unnecessary, incorrect, or completed tickets
- Merge duplicate or overlapping tickets
- Simplify long descriptions
- Correct priorities, labels, milestones, statuses, dependencies, affected files, and order
- Move verified completed work to Done
- Move genuinely blocked work to Blocked

Important rules:

- Treat the latest source code and verified live behavior as the sources of truth.
- Do not invent bugs, requirements, or experience claims.
- Preserve useful Ticket IDs when possible.
- Do not allow two tickets to perform the same work.
- Separate production/design work from architecture/maintenance work.
- Keep each ticket small enough for one focused AI implementation task.
- Put only complete, clear, testable, and unblocked tickets in Ready.
- Keep dependent work in Backlog.
- Use Blocked only when a specific decision, asset, credential, or external dependency is missing.
- Acceptance criteria must describe observable results.
- New discoveries outside a ticket’s scope should become separate Backlog tickets.

Each final ticket should contain only what is needed for implementation:

- Objective
- Verified current problem
- Evidence
- Scope
- Exact affected files or likely code areas
- Important constraints
- Acceptance criteria
- Required tests and QA steps
- Dependencies or blockers

A ticket must be understandable without reading the original audits.

## 6. Prepare for future implementation

Do not implement code, create branches, push commits, or open pull requests during this task.

The final board must be ready so that later I can say:

> Implement ticket ARC-001.

At that point, you should be able to:

1. Read and understand the ticket without guessing.
2. Confirm its dependencies are complete.
3. Create a new branch from the latest default branch.
4. Implement only the ticket’s agreed scope.
5. Add or update appropriate tests.
6. Run formatting, lint, typecheck, tests, and production build.
7. Review the changes against the acceptance criteria.
8. Commit the solution with a clear message.
9. Push the new branch to GitHub.
10. Open a pull request with a summary, verification results, and the ticket ID.
11. Update the Notion ticket status during implementation.

Do not perform these GitHub write actions now. Only ensure that the project knowledge and tickets are ready for this next step.

## Final report

After finishing the audit and board alignment, provide:

- Your understanding of the project architecture
- Your understanding of the Notion board
- Current Ready tickets
- Recommended implementation order
- Confirmed live bugs
- Source-code problems not visible in production
- Tickets removed and why
- Tickets merged
- Tickets created
- Tickets significantly edited
- Tickets moved between statuses
- Duplicate or conflicting work resolved
- Remaining decisions, assets, credentials, or information required from me
- Confirmation that the remaining Ready tickets are detailed enough for another AI to implement, test, push on a new branch, and open a pull request
