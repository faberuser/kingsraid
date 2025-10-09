# syntax=docker.io/docker/dockerfile:1.19-labs

FROM alpine/git AS git-stage
WORKDIR /usr/src/app
COPY . .

# populate git submodules or clone manually if .git is missing
RUN \
  if [ ! -d ".git" ]; then \
    echo ".git not found, cloning submodules shallowly..."; \
    rm -rf public/kingsraid-data && \
    git clone --depth=1 https://github.com/faberuser/kingsraid-data.git public/kingsraid-data && \
    rm -rf public/kingsraid-models && \
    git clone --depth=1 https://gitea.k-clowd.top/faberuser/kingsraid-models.git public/kingsraid-models && \
    rm -rf public/kingsraid-audio && \
    git clone --depth=1 https://gitea.k-clowd.top/faberuser/kingsraid-audio.git public/kingsraid-audio; \
  else \
    echo ".git found, checking submodules..."; \
    if [ -z "$(ls -A public/kingsraid-data 2>/dev/null)" ] || \
       [ -z "$(ls -A public/kingsraid-models 2>/dev/null)" ] || \
       [ -z "$(ls -A public/kingsraid-audio 2>/dev/null)" ]; then \
      echo "Populating submodules..."; \
      git submodule update --init --recursive --depth=1; \
    else \
      echo "Submodules already populated, skipping update."; \
    fi; \
  fi && \
  # Always remove .git folders from submodules
  find public/ -type d -name .git -prune -exec rm -rf {} +

FROM oven/bun:alpine AS base

ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

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
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory and source with populated submodules
FROM base AS prerelease
COPY --from=install-dev /temp/dev/node_modules node_modules
COPY --exclude=/user/src/app/public --from=git-stage /usr/src/app .

# build the application
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install-prod /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.next ./.next
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=git-stage /usr/src/app/public ./public

# expose the port
EXPOSE 3000

# start the application
ENTRYPOINT ["bunx"]
CMD ["next", "start", "-p", "3000", "-H", "0.0.0.0"]