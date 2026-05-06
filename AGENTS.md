<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# Security
- **Never** commit `.env` or `.env.local`. They contain:
- Never read .env files. Environment variable values are sensitive.
- Verify `.gitignore` includes both files before adding new env vars.
- Tenant resolver input must be sanitized — don't bypass the existing validation.

## Note:
Do not make any changes until you have 95% confidence 
in what needs to be built. Ask follow-up questions 
until you reach that confidence level.