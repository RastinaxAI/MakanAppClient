# Remove build-only package managers before creating the final filesystem layer.
# COPY from scratch keeps their bytes out of the published image, rather than
# hiding them in an upper layer while retaining the original base layers.
FROM node:22-bookworm-slim AS runtime-filesystem
RUN rm -rf /usr/local/lib/node_modules /opt/yarn* \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
    /usr/local/bin/yarn /usr/local/bin/yarnpkg

FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN --mount=type=cache,id=makan-node-npm,target=/root/.npm,sharing=locked \
    npm ci --prefer-offline --no-audit --no-fund

FROM dependencies AS build
ENV NEXT_STANDALONE=true \
    NODE_OPTIONS=--max-old-space-size=1536
COPY . .
RUN --mount=type=cache,id=makan-management-panel-next-webpack,target=/app/.next/cache,sharing=locked \
    mkdir -p public && npm run build -- --webpack

FROM scratch AS runtime
COPY --from=runtime-filesystem / /
ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
LABEL org.makan.application=makan-management-panel
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    SESSION_DIRECTORY=/app/.makan-sessions
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --chown=node:node scripts/docker-start.mjs ./docker-start.mjs
RUN mkdir -p .makan-sessions .next/cache \
    && chown node:node .makan-sessions .next/cache \
    && chmod 700 .makan-sessions
USER node
EXPOSE 3000
CMD ["node", "docker-start.mjs"]
