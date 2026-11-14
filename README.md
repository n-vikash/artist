

## Local birthday assets

This project is configured for local image replacement. The exact source files live under `assets/images/`: `artwork-01.jpg` through `artwork-32.jpg`, plus `personal-photo.jpg`. Temporary JPEG placeholders are included so the project runs before replacement. Replace those files in place; no React or configuration edits are required. The runtime serves this folder locally through Vite at `/images/...`.

The editable content source is `client/src/content.ts`. Set `name` to the birthday person’s name, change `personalMessage` if desired, and optionally add a local music path to `musicSrc`. The personal photo is only rendered on the final reveal scene, and all artwork/photo images use `object-fit: contain` so the full image remains visible.

Run locally with `pnpm install` followed by `pnpm dev`, then open the local Vite URL shown in the terminal. For a production test, use `pnpm build`.
