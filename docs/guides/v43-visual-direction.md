# V43 visual direction, reference study, and DVNM Bot implementation

Davonium's implementation must have its own brand, content, icon, and page structure. The sites below are used as sources of design principles, not as material to copy verbatim.

## Reference principles and how they map to Davonium

| Reference | Principle extracted | Davonium application |
|---|---|---|
| Lusion — project portfolio and 3D-led stories | Let a visual project lead into a case study; use depth with purpose rather than decorative overload | The home hero gives the 3D character a distinct stage, while each demo is presented as a separate experience with a direct next action |
| EPIC | Make the path from work to services and contact easy to understand | Shorter routes from the five-demo directory to services and project enquiry; focused headings and explicit sample-demo disclaimers |
| Rive | Motion should express state and remain responsive to user actions | DVNM Bot has a real Three.js scene, idle/breathing motion, blinking, pointer attention, gestures and speech-state mouth motion; visitors open the bot and request voice themselves |
| Neal.fun — Deep Sea | Use progressive exploration and layered visual information to encourage curiosity | Skills and Digital concepts can reveal information in steps instead of presenting a wall of marketing copy; animation is secondary to readable content |
| Unseen | Use strong motion and curated project discovery to create a portfolio with a point of view | Creative is positioned as the visual case-study destination; the core demo set is smaller and easier to choose from |
| Uncommon Studio | Distinct editorial hierarchy, typography, generous spacing, and project-specific tone | The five core demo pages keep different purposes/visual identities while staying within the Davonium family |
| Cloudflare | State the product/service proposition clearly, show the next action, and make trust/security details easy to find | Clear service pathways, product status language, HTTPS/canonical metadata, deployment safeguards and honest demo boundaries |
| OpenAI | Separate company story, product destinations, and clear primary actions | Davonium's company story, demo directory, product pages and service enquiry are distinct routes instead of one overloaded landing page |

These are design interpretations, not a claim that any reference site uses the same implementation techniques as Davonium. No reference site's source code, protected artwork, identity, or exact copy is reused as a template.

## Five primary demo experiences

1. **DVNM Biz** — company and service website patterns, drawing on clear service journeys and trustworthy company communication. Growth/marketing content is folded into this experience.
2. **DVNM Market** — product discovery and a clear catalogue-to-action flow. All prices/cart interactions in the existing sample remain illustrative, not real payment processing.
3. **DVNM Creative** — a visual portfolio and case-study destination, informed by curated project discovery and motion-led storytelling while retaining original Davonium artwork.
4. **DVNM Skills** — a learning and skills experience, informed by progressive exploration and clear information grouping. Community/activity material is folded into Skills; old routes remain for compatibility.
5. **DVNM Digital** — the software/product-company destination for product status, interactive demos, technical trust and a simple project enquiry.

The older sample routes and seven-route certificate/QR PDF are retained as a clearly labelled legacy archive, not promoted as the current primary set.

## Three.js DVNM Bot

The home hero and selected robot previews use a browser-rendered Three.js scene built from procedural geometry. The model has a head, faceplate, eyes, animated mouth, antenna, neck, layered torso, emissive chest core, articulated arms and legs, a foot ring, orbit halo, and small data motes. It is a mesh-built procedural character, not a custom sculpted Blender/GLB asset and not a Unity/Godot game.

The renderer loads only near visible canvases, caps pixel ratio, reduces anti-aliasing on small/low-power devices, pauses when hidden/off-screen, and respects reduced-motion preference. Pointer movement gently changes head attention; speech state animates the mouth and gesture; theme changes update material treatment. A local existing artwork asset remains as a fallback if WebGL or the CDN fails.

Speech is browser-native Speech Synthesis. Mouth motion follows a speaking state and is not guaranteed phoneme-level lip synchronisation; available voice and pronunciation depend on the visitor's browser/device. No visitor answers are transmitted by this renderer.

## Release limitations

Static QA passed for the release's local HTML paths and syntax checks. The headless browser screenshot attempt did not complete in this environment, and physical mobile-device testing remains outstanding. Actual first-load 3D rendering requires CDN access to Three.js; the site remains readable if that dependency fails. GitHub Pages/DNS settings and a live publish are not altered from this build environment and must be verified after the authenticated deployment script runs.
