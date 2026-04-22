FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS build
WORKDIR /app
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund --ignore-scripts
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

RUN mkdir -p /app/uploads/blog && chown -R nextjs:nodejs /app/uploads

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/content ./content

# DB migrations at container start (isolated under /migrate — standalone /app/node_modules untouched)
COPY scripts/migrate-package.json /migrate/package.json
WORKDIR /migrate
RUN mkdir -p scripts src/lib
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/scripts/migrate.ts ./scripts/migrate.ts
COPY --from=build /app/src/lib/migrations.ts ./src/lib/migrations.ts
COPY --from=build /app/src/lib/database.ts ./src/lib/database.ts
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

WORKDIR /app
COPY scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && \
    chown -R nextjs:nodejs /app /migrate

USER nextjs
EXPOSE 8080

ENTRYPOINT ["./docker-entrypoint.sh"]
