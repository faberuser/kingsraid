FROM alpine/git AS git-stage
WORKDIR /usr/src/app
COPY . .

# set up build args so Docker can detect changes and cache intelligently
ARG KRDATA_REPO=https://github.com/faberuser/kingsraid-data.git
ARG KRMODELS_REPO=https://gitea.k-clowd.top/faberuser/kingsraid-models.git
ARG KRAUDIO_REPO=https://gitea.k-clowd.top/faberuser/kingsraid-audio.git

# create directories for caching
RUN mkdir -p /cache/kingsraid-data /cache/kingsraid-models /cache/kingsraid-audio

# populate submodules or clone shallow copies if .git is missing
RUN \
  if [ ! -d ".git" ]; then \
    echo ".git folder not found, cloning submodules shallowly (with caching)..."; \
    for repo in kingsraid-data kingsraid-models kingsraid-audio; do \
      echo "Checking cache for $repo..."; \
      if [ -d "/cache/$repo" ]; then \
        echo "Using cached $repo..."; \
        cp -r /cache/$repo "public/$repo"; \
      else \
        echo "Cloning $repo..."; \
        case $repo in \
          kingsraid-data) git clone --depth=1 $KRDATA_REPO "public/$repo" ;; \
          kingsraid-models) git clone --depth=1 $KRMODELS_REPO "public/$repo" ;; \
          kingsraid-audio) git clone --depth=1 $KRAUDIO_REPO "public/$repo" ;; \
        esac && \
        rm -rf "public/$repo/.git" && \
        cp -r "public/$repo" "/cache/$repo"; \
      fi; \
    done; \
  else \
    echo ".git folder found, checking submodules..."; \
    if [ -z \"$(ls -A public/kingsraid-data 2>/dev/null)\" ] || \
       [ -z \"$(ls -A public/kingsraid-models 2>/dev/null)\" ] || \
       [ -z \"$(ls -A public/kingsraid-audio 2>/dev/null)\" ]; then \
      echo "Populating submodules..."; \
      git submodule update --init --recursive --depth=1; \
      find public/ -type d -name .git -prune -exec rm -rf {} +; \
    else \
      echo "Submodules already populated, skipping update."; \
    fi; \
  fi

FROM oven/bun:alpine AS base

# ARG NEXT_PUBLIC_SITE_URL
# ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

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
COPY --from=git-stage /usr/src/app .

# build the application
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install-prod /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.next ./.next
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/public ./public

# expose the port
EXPOSE 3000

# start the application
ENTRYPOINT ["bunx"]
CMD ["next", "start", "-p", "3000", "-H", "0.0.0.0"]