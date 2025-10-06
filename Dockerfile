FROM alpine/git AS git-stage
WORKDIR /usr/src/app
COPY . .

# Remove existing submodule dirs if exists, then clone fresh
RUN rm -rf public/kingsraid-data && git clone https://github.com/faberuser/kingsraid-data.git public/kingsraid-data
RUN rm -rf public/kingsraid-models && git clone https://gitea.k-clowd.top/faberuser/kingsraid-models.git public/kingsraid-models
RUN rm -rf public/kingsraid-audio && git clone https://gitea.k-clowd.top/faberuser/kingsraid-audio.git public/kingsraid-audio

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