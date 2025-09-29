FROM alpine/git AS git-stage
WORKDIR /src
COPY . .
# Remove existing kingsraid-data & kingsraid-models directory if it exists, then clone fresh
RUN rm -rf kingsraid-data && git clone https://github.com/faberuser/kingsraid-data.git kingsraid-data
RUN rm -rf kingsraid-models && git clone https://github.com/faberuser/kingsraid-models.git kingsraid-models

FROM oven/bun:alpine AS base
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
COPY --from=git-stage /src .

# build the application
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install-prod /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.next ./.next
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/public ./public
COPY --from=prerelease /usr/src/app/kingsraid-data ./public/kingsraid-data
COPY --from=prerelease /usr/src/app/kingsraid-models ./public/kingsraid-models

# expose the port
EXPOSE 3000

# start the application
ENTRYPOINT ["bunx"]
CMD ["next", "start", "-p", "3000", "-H", "0.0.0.0"]