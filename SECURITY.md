# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not** open a public GitHub issue for security vulnerabilities.

**Do** contact the maintainer directly by:
1. Opening a **private** security advisory on GitHub (Security → Advisories → New draft security advisory)
2. Describing the vulnerability clearly — steps to reproduce, impact, and suggested fix if known

I will acknowledge your report within 48 hours and aim to release a patch within 7 days for critical issues.

## Scope

This project is a frontend application. Security concerns relevant to this project include:

- Cross-site scripting (XSS)
- Sensitive data exposure (API keys, tokens in client-side code)
- Dependency vulnerabilities (run `npm audit` to check)

## Thank You

Thank you for helping keep this project safe.
