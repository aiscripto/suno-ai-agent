---
target: voice widget (src/components/voice-agent)
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
timestamp: 2026-11-08T19-01-35Z
slug: src-components-voice-agent
---
# Critique: NexusAgent voice widget (src/components/voice-agent)

Method: dual-agent (A: design review sub-agent · B: detector sub-agent). Browser overlay skipped: no browser automation tool in session.

## Design Health Score: 18/40 (Poor)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Phases distinct, but status repeated in 4 places; 120 s session cap not shown |
| 2 | Match system / real world | 2 | Ops jargon to customers ("Routing conversation packet", "turn cap"); classification labels shown |
| 3 | User control and freedom | 2 | 5 s auto-reset after end; 3 s idle wipe with no "still here" |
| 4 | Consistency and standards | 2 | Classic widget is hold-to-talk + "Chat with us"; Nexus is tap-toggle console |
| 5 | Error prevention | 2 | Good incomplete-request guard; no mic-permission priming |
| 6 | Recognition rather than recall | 3 | Controls visible; barge-in undiscoverable |
| 7 | Flexibility and efficiency | 1 | No text fallback wired (sendText unused), no shortcuts |
| 8 | Aesthetic and minimalist | 1 | Robot avatar + 11-layer animated background outrank an 82 px mic |
| 9 | Error recovery | 1 | Raw String(err) shown twice; save-failed card has no retry |
| 10 | Help and documentation | 1 | Nothing on mic permission, data use, language switch |

## Priority issues
- [P0] Positive-path save failure leaves a control-less screen (nexus-agent.tsx:233-253, 366, 418, 496); "Reference" shown when no ticket is a client-side random sessionRef (:132, :464). → harden
- [P1] Mic denial / failures dead-end with raw error text (use-voice-agent.ts:304,378,441,475); no "type instead"; no save retry. → clarify, harden
- [P1] Classification and personal data exposed to the customer: mood recolour (:302), mood chip (:639-647), "Formal Complaint" badge (:474-479), lead name/phone chip (:801-809). → distill
- [P1] Inverted hierarchy and motion: 178-196 px robot above 82 px mic; 4 duplicate status lines; 42 keyframes, zero prefers-reduced-motion. → layout, quieter, animate
- [P2] 5 s end auto-reset and 3 s idle wipe too fast (:210-223, :288-292). → harden

## Detector (configured, widget TSX): 17 findings
bounce-easing nexus-agent.tsx:756 (real), layout-transition :752 (real), 14 design-system-color (9× #F43F5E error colour off-palette, #00F5FF near-duplicate of signal cyan in avatar.tsx:11, 2 scrim false positives, 2 var() fallbacks), 1 font-size (transcript-panel.tsx:99). globals.css: 273 advisories (181 colour, 52 size, 36 radius) + 3 bounce (1 false positive) + grid background. Config suppresses 4 gradient-text; dark-glow ignore currently suppresses nothing.

## Persona red flags
- Casey (mobile): transcript below the fold; 38 px icon-only End next to language pills; idle wipe after app switch.
- Sam (screen reader/keyboard): modals lack dialog role/focus; no :focus-visible on .nx-btn; errors not role=alert; classic mic pointer-only.
- Jordan (first-timer): no data/mic explanation; jargon; non-interactive close cue styled as a button.
- Older Urdu-first walk-in customer: tiny EN/اردو toggle disabled while recording; all instructions English; no dir="auto"/Urdu font; red recolour during complaint in front of others.

## Questions
1. Why does the UI turn red and say "Formal Complaint" while the customer is still complaining?
2. Would "We heard: …" in large type beat an animated robot as the hero?
3. Should reset at a staffed counter be a staff action rather than a 5 s timer?
