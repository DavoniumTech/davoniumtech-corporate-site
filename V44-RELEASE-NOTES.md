# V44 Deployment Repair

- Replaced the deployment script with a Windows PowerShell 5.1-compatible, ASCII-only script.
- The single PowerShell command extracts this ZIP and runs the included deployment script; no separate script download is required.
- Publishes only after reviewing the staged file list and typing PUSH.
- Never force-pushes, creates a remote safety branch, and verifies the final main commit.
- Excludes directory.md, deploy tooling, and common credential material.
- Static syntax-balance and packaging checks are performed; native Windows PowerShell execution is not available in the build environment.
