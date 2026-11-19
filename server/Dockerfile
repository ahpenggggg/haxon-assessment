# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --workspace server
COPY server server
RUN npm run build --workspace server

# ---- runtime ----
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --workspace server --omit=dev && npm cache clean --force
COPY --from=build /app/server/dist server/dist
USER node
EXPOSE 4000
CMD ["node", "server/dist/index.js"]
