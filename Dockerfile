# syntax=docker.io/docker/dockerfile:1.19-labs

# ---------------------------------------------------------------------------
# data-stage: clone the large model/audio repos (~35 GB combined).
#
# This stage has NO dependency on source files (no COPY . .) so its cache key
# depends only on NEXT_PUBLIC_ENABLE_MODELS_VOICES and ASSETS_CACHE_VERSION.
# Repeated code pushes will NOT re-download the data as long as those two
# build-args remain unchanged.
#
# To force a fresh clone after upstream repo updates, bump ASSETS_CACHE_VERSION
# at build time:
#   docker build --build-arg ASSETS_CACHE_VERSION=2 ...
# ---------------------------------------------------------------------------
FROM alpine/git AS data-stage
ARG NEXT_PUBLIC_ENABLE_MODELS_VOICES=false
ARG ASSETS_CACHE_VERSION=1

RUN \
  if [ "$NEXT_PUBLIC_ENABLE_MODELS_VOICES" = "true" ]; then \
    echo "Cloning kingsraid-models and kingsraid-audio (NEXT_PUBLIC_ENABLE_MODELS_VOICES=true)..."; \
    git clone --depth=1 https://gitea.k-clowd.top/faberuser/kingsraid-models.git /tmp/kingsraid-models && \
    git clone --depth=1 https://gitea.k-clowd.top/faberuser/kingsraid-audio.git /tmp/kingsraid-audio && \
    find /tmp/kingsraid-models /tmp/kingsraid-audio -type d -name .git -prune -exec rm -rf {} +; \
  else \
    echo "Skipping models and audio clones (NEXT_PUBLIC_ENABLE_MODELS_VOICES not set to true)"; \
    mkdir -p /tmp/kingsraid-models /tmp/kingsraid-audio; \
  fi

# ---------------------------------------------------------------------------
# git-stage: copy source files and populate only kingsraid-data.
# Models and audio are handled entirely by data-stage above.
# ---------------------------------------------------------------------------
FROM alpine/git AS git-stage
WORKDIR /usr/src/app
COPY . .

# Always wipe any previously-copied submodule directories before re-cloning,
# so this layer is deterministic regardless of what was in the build context.
RUN \
  rm -rf public/kingsraid-data public/kingsraid-models public/kingsraid-audio && \
  git clone --depth=1 https://github.com/faberuser/kingsraid-data.git public/kingsraid-data && \
  # remove .git folders from submodules so they don't bloat the image
  find public/ -type d -name .git -prune -exec rm -rf {} +

FROM oven/bun:alpine AS base

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ENABLE_MODELS_VOICES=false
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_ENABLE_MODELS_VOICES=$NEXT_PUBLIC_ENABLE_MODELS_VOICES

WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install-dev
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
FROM base AS install-prod
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production && \
    bun add typescript --dev

# copy node_modules from temp directory and source with populated submodules
FROM base AS prerelease
COPY --from=install-dev /temp/dev/node_modules node_modules
# public/ is intentionally included here.
#
# The list pages (app/heroes, app/artifacts, app/bosses, etc.) are Next.js
# App Router async server components that call lib/get-data.ts unconditionally
# at build time — no isStaticExport guard. Next.js renders and caches them
# statically during `bun run build`, so public/kingsraid-data must be present
# or the lists are generated empty.
#
# This is safe: git-stage already strips kingsraid-models and kingsraid-audio,
# so public/ here contains only kingsraid-data (a few MB of JSON) — no 35 GB.
#
# The original Dockerfile used --exclude=/usr/src/app/{public,out} which used
# absolute paths that BuildKit never matched (it uses source-relative patterns),
# making the exclusion a silent no-op. Restoring that behaviour intentionally.
COPY --exclude=out --from=git-stage /usr/src/app .

# build the application
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release

COPY --from=install-prod /temp/prod/node_modules ./node_modules
COPY --from=prerelease /usr/src/app/.next ./.next
COPY --from=prerelease /usr/src/app/package.json ./package.json
COPY --from=prerelease /usr/src/app/next.config.ts ./next.config.ts

# kingsraid-data and all other static public assets.
# git-stage already cleaned out models/audio, so this COPY never includes them.
COPY --from=git-stage /usr/src/app/public ./public
# Models and audio come from data-stage. Because data-stage has no dependency
# on source files, its layer content hashes are stable across code pushes when
# the upstream repos haven't changed — repeated builds skip the ~35 GB cache
# writes and registry uploads for these two layers entirely.
COPY --from=data-stage /tmp/kingsraid-models ./public/kingsraid-models
COPY --from=data-stage /tmp/kingsraid-audio ./public/kingsraid-audio

# expose the port
EXPOSE 3000

# start the application
ENTRYPOINT ["bunx"]
CMD ["next", "start", "-p", "3000", "-H", "0.0.0.0"]
