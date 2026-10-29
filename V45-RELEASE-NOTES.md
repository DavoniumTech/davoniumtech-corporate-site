# V45 Release Notes — Davonium Technologies

## Visual direction

V45 adopts a clean, high-contrast technology editorial system with live 3D geometry in page-header scenes. Light mode uses a pale architectural stage and warmer accents; dark mode uses a solid, clear near-black/navy surface, cool cyan accents, and a different animation direction. Both retain the same content and navigational meaning.

## Virtual presenter

The homepage's full-body robot is replaced with a procedurally modelled human presenter built from live Three.js meshes: a tapered head and face, hair, eyes, nose, mouth/jaw, jacket, shirt, articulated arms, hands, trouser legs, shoes, and a subtle illuminated platform. It has idle breathing, head tracking, welcoming hand gestures and approximate mouth movement during optional browser speech. A transparent CGI image is kept only as a graceful fallback when WebGL or the module CDN is unavailable.

## DVNM Bot

The visitor assistant is now a compact head-only control. The panel is anchored above the WhatsApp action, uses internal scrolling, keeps voice settings collapsed, and switches between Hear and Stop actions instead of showing both at once. Legacy floating assistants are suppressed. No speech starts automatically.

## Demo Studio and docs

The five public demonstrations retain their own functional content and now have separate scene palettes and motion: business, commerce, creative, learning, and digital products. Creative and Skills include explicit scene modes. Documentation retains all guide content and gains category filters in addition to instant local search.

## Showcase certificate

The certificate page creates a personal, non-official showcase image in the browser. Visitors can select one experience or all five, download a high-resolution PNG, print/save as PDF, or use the native share sheet where supported. The generated image explicitly disclaims academic accreditation and client-work verification.

## Engineering and safety

- V45 service-worker cache version avoids reusing stale V44 static assets.
- Common secret files and `directory.md` are excluded from the publisher.
- The publisher clones the current remote main branch, never force-pushes, checks staged file names, creates a rollback reference, requires the user to type `PUSH`, and verifies the remote commit.
- The Three.js scene is dynamically loaded from jsDelivr and degrades to local CSS/asset fallback if unavailable. Speech synthesis and lip movement remain device/browser dependent.

## QA caveat

Static validation is part of the release. A live deployment and physical Android/iOS/tablet QA are not claimed until performed on the target hosting and devices.
