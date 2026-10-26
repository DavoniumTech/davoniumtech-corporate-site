# Davonium Technologies V46 — Final Repair Release

## What changed
- Homepage hero uses the same angular white-and-cyan articulated DVNM Bot 3D model that appears in the welcome and Work showcase.
- The old full-body human presenter is removed from the visible experience.
- The two archived concept images have been removed from Our Work and the source package; the second concept was used only as a visual reference for the articulated bot.
- Homepage welcome is a compact, first-visit, session-scoped dialog after the 2-second wordmark entry. It is skippable and never plays audio automatically.
- Full robot meshes are used for welcome/home/Work; the floating launcher is a single head-only control beside WhatsApp.
- The panel uses one toggle speech button, a two-column topic grid on phones, and bounded scrolling.
- Light mode uses a bright clean halo; dark mode uses crisp navy surfaces and different orbit motion, with no backdrop blur.
- Existing certificate/share UI, legal pages, documentation, products, and core site routes are retained.
- Repaired PowerShell 5.1 deployment script is included in the ZIP. It requests PUSH, stages without force, backs up the previous main commit, excludes directory.md and secrets, and verifies the remote commit.

## Honest test state
Static HTML, JavaScript, CSS, and link checks are performed for this package. Three.js is loaded from a CDN when the robot enters view; the source SVG appears if WebGL or the CDN is unavailable. Physical device testing and live GitHub publication require the owner to run and approve the included deploy script.

## Static verification
- 73 HTML pages and 3,237 local references checked; no unresolved local references or duplicate HTML IDs.
- 8 JavaScript files passed `node --check`; 7 CSS files parsed without errors; 21 SVG files parsed as XML.
- JSON, web manifest, sitemap and XML checks passed.
- The PowerShell publisher is encoded UTF-8 with BOM and Windows CRLF line endings for Windows PowerShell 5.1 compatibility. This environment does not include Windows PowerShell, so final native execution must be verified on the owner's machine.
- The ZIP has not been pushed. The publisher asks for exact `PUSH` approval and never uses force push.
