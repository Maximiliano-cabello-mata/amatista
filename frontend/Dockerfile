# frontend/Dockerfile — Compilación y servicio de la PWA con Caddy
FROM node:20-alpine AS compilador
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
COPY practices/ ./practices/
RUN npm run build

FROM caddy:2.8-alpine
COPY --from=compilador /app/dist /srv
EXPOSE 8080
CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":8080"]
