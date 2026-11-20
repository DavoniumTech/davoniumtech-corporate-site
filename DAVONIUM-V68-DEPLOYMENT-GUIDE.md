# V68 Review Candidate — Safe Deployment Guide

## Current status

This package is a review candidate. It has **not** been pushed to GitHub, merged into `main`, or deployed to Cloudflare by this build process. Do not use it as a production deploy until the open QA items are checked and the owner explicitly approves publication.

## Pre-publication checklist

1. Keep the supplied original ZIP as the rollback source. The review candidate contains no deleted source files.
2. Compare the candidate against a fresh checkout of the exact target GitHub branch. The supplied ZIP has no `.git` folder. Its reconstructed Git tree was nevertheless verified to match the current `main` tree at `c2312478f1b155dc6184c4c3b63412b22841a846`; the working copy itself remains outside the repository history until its changes are committed.
3. Review the complete file diff, especially homepage markup, global CSS, demo styles, workspace renderer and `sw.js`.
4. Perform the browser/mobile/theme/interaction checks in `DAVONIUM-V68-IMPLEMENTATION-PLAN.md`.
5. Confirm that the intended destination is the development branch or production `main`. Do not infer this from a prior script or a comparison URL.
6. Obtain explicit approval before any GitHub write or Cloudflare deployment.

## Cloudflare note

A successful GitHub update does not by itself prove that Cloudflare Pages has deployed the same commit. After any approved publication, verify the Pages deployment source, deployed commit and live site separately. Clear or rotate the service-worker cache only through the committed `sw.js` release; avoid manual production cache deletion as a substitute for a tested release.

## Rollback

Retain the original source archive and the last known-good production commit. If a post-approval deployment fails, roll back through the Cloudflare Pages deployment history or restore the last known-good Git revision using the team's normal release procedure. Do not force-push shared history.
