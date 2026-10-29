# V41 deployment hotfix — 25 October 2026

This package preserves the V40 website and visual implementation. V41 fixes a deployment-script validation issue discovered when Git interpreted generated PDF showcase certificates as text and reported their normal internal PDF whitespace as trailing whitespace.

- The deployment script now runs Git whitespace checks with CRLF-aware handling, preserving checks for text sources.
- Generated PDF certificates are excluded from source whitespace checks because PDF binary/object streams are not source text; all seven PDFs are still included and checked for presence by the release script.
- The Windows entry point and PowerShell script are versioned as `DEPLOY-V41-WINDOWS.cmd` and `Deploy-V41.ps1`.
- V40 deployment entry points are removed from the target repository during the release to reduce confusion.
- Backup creation, clean repository selection, no-force-push, explicit user confirmation, and remote commit SHA verification remain enabled.

## What happened in the failed V40 attempt

The V40 script reached staging, created a local safety backup and remote backup branch, then stopped during `git diff --cached --check` because the PDF certificate files contain normal PDF syntax and encoded content that Git reported as trailing whitespace. That failure happened before the commit/push step. V41 corrects the check rather than disabling all whitespace validation.

## Scope

No site design, HTML, JavaScript, CSS, demo, or certificate content is changed in this hotfix. It is a deployment-workflow correction for the complete V40 website bundle.
