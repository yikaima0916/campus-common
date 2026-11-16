<p align="center">
  <img src="public/icon-192.png" alt="Campus Common logo" width="88">
</p>

<h1 align="center">Campus Common</h1>

<p align="center"><strong>One place for academic support and campus life.</strong></p>

<p align="center">
  <a href="https://campus-common.pages.dev/">Open Campus Common</a> ·
  <a href="#current-workspace">Current workspace</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

University information is spread across email, course platforms and campus notices. Campus Common brings the information students need to act on into one workspace. It starts with Chinese-speaking students who read English-language university notices, helping them understand what matters, find a deadline and decide what to do next.

## Current workspace

| Feature | What students can do |
| --- | --- |
| Campus email | Connect Outlook, bring university email into the workspace, and open the original message to verify details. |
| Chinese-first reading | Use Simplified or Traditional Chinese. When AI is configured and available, read Chinese key points or a translation alongside the English original. |
| Email to task | Review a suggested action and its deadline against the source. The student decides whether to add it to their task list. |
| Tasks and reminders | Organise personal tasks, set deadlines and reminders, and export dates to a calendar. |
| Group work | Coordinate assignments, responsibilities, availability and meeting decisions with classmates. |
| Daily digest | Review grouped campus updates and follow-ups. Scheduled delivery depends on the deployment configuration. |

## Roadmap

| Area | Planned |
| --- | --- |
| Academic Hub | Course and lecturer reviews, peer notes, and semester and degree planning. |
| Campus Life Hub | Event and ILP discovery, finding teammates, student communities, and exchange of textbooks and dorm items. |
| University integrations | Explore Moodle and degree-audit integration, subject to university approval and student consent. |

As we develop the workspace, we want to test whether students can find deadlines faster, identify the right next step more accurately, and spend less effort reading university notices.

## Development

Campus Common is a progressive web app built with JavaScript, Cloudflare Workers and D1. Microsoft Graph supports Outlook connections. Workers AI and Web Push are configurable.

- [Local setup](docs/SETUP.md)
- [Outlook integration](docs/OUTLOOK_SETUP.md)

Run `pnpm test` before submitting a change. Use a test account and sample messages during development, and keep student records and credentials out of the repository.
