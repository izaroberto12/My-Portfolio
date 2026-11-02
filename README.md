# Roberto Izaguirre · Design Portfolio

Live site: https://izaroberto12.github.io/My-Portfolio/

Publishing and working branch: `portfolio-redesign-2026`. **Do not edit `master`**.

A static personal portfolio built with HTML, CSS and JavaScript and hosted on GitHub Pages. Design decisions, content and publishing are directed by Roberto, with AI-assisted development.

## Featured pages

- `index.html` — Home, three featured projects, experience, tools, about and contact.
- `work/graphic-design.html` — Professional Graphic Production at Frazer. Artwork is team-developed and client-reviewed; Roberto's main role is production, with design and installation contributions.
- `work/project-row-houses.html` — Three-person collaborative nonprofit UX/UI concept, with original portfolio artifacts.
- `work/verde.html` — Two-person restaurant-discovery UX/UI concept, with original archived artwork. Not a live app.

Archived, not featured: `work/nasa.html` and `work/portfolio-build.html`. Both should stay out of the public sitemap.

## Design system

- `assets/style.css`: shared legacy base styles.
- `assets/editorial.css`: production and Project Row Houses editorial structure.
- `assets/home.css`: home-specific layout and dark/paper screenprint palette.
- `assets/verde.css`: Verde's original green visual identity.
- `assets/portfolio-system.css`: shared Superpop typography, navigation, rounded cards, case-study treatment.
- Adobe Fonts kit: `https://use.typekit.net/qjr3tcz.css`.
- `assets/script.js`: accessible mobile navigation, Escape key and resize behavior.
- `assets/photo-upgrades.js`: safe optional image loading, hiding incomplete photo sections until assets exist.

## Image integrity

Vehicle photography documents real work, not solely authored design. Website and app screenshots should be contained with original proportions. Any added photography must use accurate alt text and captions; no fabricated client claims.

The following optional production images are prepared but **not yet in the repository**:

- `assets/ambulance/schertz-ems.jpg` — homepage only
- `assets/ambulance/fayette-county-ems.jpg` — case-study vehicle
- `assets/ambulance/texas-am-ems.jpg` — case-study vehicle
- `assets/ambulance/jackson-county-print.jpg` — production workflow

## Responsive QA

`.github/workflows/responsive-audit.yml` runs Playwright + axe-core against four active pages at 24 viewports from 280 to 3440 CSS pixels. It checks horizontal overflow, mobile-menu open/Escape behavior, script errors, broken visible images and WCAG A/AA violations, and uploads screenshots + JSON results as an Actions artifact. It does not replace manual visual and usability review.

## Verification

Check the publishing branch, [GitHub Actions](https://github.com/izaroberto12/My-Portfolio/actions), and rendered desktop/mobile pages before interview use. Avoid changes to `master`.
