# syntax=docker.io/docker/dockerfile:1.19-labs

# clone and cache the large model/audio repos for future builds
FROM alpine/git AS data-stage
ARG NEXT_PUBLIC_ENABLE_MODELS_VOICES=false

RUN \
  if [ "$NEXT_PUBLIC_ENABLE_MODELS_VOICES" = "true" ]; then \
    echo "Resolving HEAD hashes for cache-busting..."; \
    MODELS_HASH=$(git ls-remote https://gitea.k-clowd.top/faberuser/kingsraid-models.git HEAD \
      2>/dev/null | cut -f1 | cut -c1-8 || echo "unknown") & \
    PID1=$!; \
    AUDIO_HASH=$(git ls-remote https://gitea.k-clowd.top/faberuser/kingsraid-audio.git HEAD \
      2>/dev/null | cut -f1 | cut -c1-8 || echo "unknown") & \
    PID2=$!; \
    wait $PID1 $PID2; \
    echo "${MODELS_HASH}-${AUDIO_HASH}" > /tmp/.assets-version; \
    echo "Assets version: $(cat /tmp/.assets-version)"; \
    echo "Cloning kingsraid-models and kingsraid-audio (NEXT_PUBLIC_ENABLE_MODELS_VOICES=true)..."; \
    git clone --depth=1 https://gitea.k-clowd.top/faberuser/kingsraid-models.git /tmp/kingsraid-models & \
    git clone --depth=1 https://gitea.k-clowd.top/faberuser/kingsraid-audio.git /tmp/kingsraid-audio & \
    wait && \
    find /tmp/kingsraid-models /tmp/kingsraid-audio -type d -name .git -prune -exec rm -rf {} +; \
  else \
    echo "Skipping models and audio clones (NEXT_PUBLIC_ENABLE_MODELS_VOICES not set to true)"; \
    mkdir -p /tmp/kingsraid-models /tmp/kingsraid-audio; \
  fi

# copy source files and populate only kingsraid-data
FROM alpine/git AS git-stage
WORKDIR /usr/src/app
COPY . .

# always wipe any previously-copied submodule directories before re-cloning,
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
RUN --mount=type=cache,target=/root/.bun/install/cache \
  cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
FROM base AS install-prod
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN --mount=type=cache,target=/root/.bun/install/cache \
  cd /temp/prod && bun install --frozen-lockfile --production && \
  bun add typescript --dev

# copy node_modules from temp directory and source with populated submodules
FROM base AS prerelease
COPY --from=install-dev /temp/dev/node_modules node_modules
COPY --exclude=out --from=git-stage /usr/src/app .

# build the application
RUN --mount=type=cache,target=/usr/src/app/.next/cache \
  bun run build

# copy production dependencies and source code into final image
FROM base AS release

COPY --from=install-prod /temp/prod/node_modules ./node_modules
COPY --from=prerelease /usr/src/app/.next ./.next
COPY --from=prerelease /usr/src/app/package.json ./package.json
COPY --from=prerelease /usr/src/app/next.config.ts ./next.config.ts

COPY --from=git-stage /usr/src/app/public ./public
COPY --from=data-stage /tmp/kingsraid-models ./public/kingsraid-models
COPY --from=data-stage /tmp/kingsraid-audio ./public/kingsraid-audio

# expose the port
EXPOSE 3000

# start the application
ENTRYPOINT ["bunx"]
CMD ["next", "start", "-p", "3000", "-H", "0.0.0.0"]
