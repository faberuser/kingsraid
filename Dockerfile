# syntax=docker.io/docker/dockerfile:1.19-labs

FROM alpine/git AS git-stage
ARG NEXT_PUBLIC_ENABLE_MODELS_VOICES=false
WORKDIR /usr/src/app
COPY . .

# remove models and audio submodules if they were copied and env is not enabled
RUN \
  if [ "$NEXT_PUBLIC_ENABLE_MODELS_VOICES" != "true" ]; then \
    echo "Removing models and audio submodules (if present) since NEXT_PUBLIC_ENABLE_MODELS_VOICES is not true..."; \
    rm -rf public/kingsraid-models public/kingsraid-audio; \
  fi

# populate git submodules or clone manually if .git is missing
RUN \
  if [ ! -d ".git" ]; then \
    echo ".git not found, cloning submodules shallowly..."; \
    rm -rf public/kingsraid-data && \
    git clone --depth=1 https://github.com/faberuser/kingsraid-data.git public/kingsraid-data; \
    if [ "$NEXT_PUBLIC_ENABLE_MODELS_VOICES" = "true" ]; then \
      echo "Cloning models and audio submodules..."; \
      rm -rf public/kingsraid-models && \
      git clone --depth=1 https://gitea.k-clowd.top/faberuser/kingsraid-models.git public/kingsraid-models && \
      rm -rf public/kingsraid-audio && \
      git clone --depth=1 https://gitea.k-clowd.top/faberuser/kingsraid-audio.git public/kingsraid-audio; \
    else \
      echo "Skipping models and audio submodules (NEXT_PUBLIC_ENABLE_MODELS_VOICES not set to true)"; \
    fi; \
  else \
    echo ".git found, checking submodules..."; \
    if [ -z "$(ls -A public/kingsraid-data 2>/dev/null)" ]; then \
      echo "Populating kingsraid-data submodule..."; \
      git submodule update --init --depth=1 public/kingsraid-data; \
    else \
      echo "kingsraid-data already populated."; \
    fi; \
    if [ "$NEXT_PUBLIC_ENABLE_MODELS_VOICES" = "true" ]; then \
      if [ -z "$(ls -A public/kingsraid-models 2>/dev/null)" ] || \
         [ -z "$(ls -A public/kingsraid-audio 2>/dev/null)" ]; then \
        echo "Populating models and audio submodules..."; \
        git submodule update --init --depth=1 public/kingsraid-models public/kingsraid-audio; \
      else \
        echo "Models and audio submodules already populated."; \
      fi; \
    else \
      echo "Skipping models and audio submodules (NEXT_PUBLIC_ENABLE_MODELS_VOICES not set to true)"; \
    fi; \
  fi && \
  # always remove .git folders from submodules
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
COPY --exclude=/usr/src/app/{public,out} --from=git-stage /usr/src/app .

# build the application
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
ARG NEXT_PUBLIC_ENABLE_MODELS_VOICES=false
ENV NEXT_PUBLIC_ENABLE_MODELS_VOICES=$NEXT_PUBLIC_ENABLE_MODELS_VOICES

COPY --from=install-prod /temp/prod/node_modules ./node_modules
COPY --from=prerelease /usr/src/app/.next ./.next
COPY --from=prerelease /usr/src/app/package.json ./package.json
COPY --from=prerelease /usr/src/app/next.config.ts ./next.config.ts

# selectively copy public folder based on NEXT_PUBLIC_ENABLE_MODELS_VOICES
COPY --from=git-stage /usr/src/app/public ./public
RUN \
  if [ "$NEXT_PUBLIC_ENABLE_MODELS_VOICES" != "true" ]; then \
    echo "Removing models and audio from final image (NEXT_PUBLIC_ENABLE_MODELS_VOICES not set to true)..."; \
    rm -rf ./public/kingsraid-models ./public/kingsraid-audio; \
  else \
    echo "Keeping models and audio in final image (NEXT_PUBLIC_ENABLE_MODELS_VOICES=true)"; \
  fi

# expose the port
EXPOSE 3000

# start the application
ENTRYPOINT ["bunx"]
CMD ["next", "start", "-p", "3000", "-H", "0.0.0.0"]