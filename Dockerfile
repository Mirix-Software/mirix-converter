FROM node:20.17.0-alpine AS base
WORKDIR /home/file-converter

COPY package.json ./

FROM base AS dev-dependencies

COPY package-lock.json ./

RUN npm ci

FROM base AS check-runner

COPY --from=dev-dependencies /home/file-converter/node_modules ./node_modules

FROM base AS libreoffice

RUN apk add --no-cache \
    libreoffice

RUN apk add --no-cache \
    font-noto \
    font-noto-cjk \
    font-noto-extra \
    terminus-font \
    ttf-font-awesome \
    ttf-dejavu \
    ttf-freefont \
    ttf-hack \
    ttf-inconsolata \
    ttf-liberation \
    ttf-mononoki \
    ttf-opensans \
    fontconfig \
    chromium

FROM dev-dependencies AS builder

COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY sources ./sources

RUN npm run build

FROM base AS dependencies

COPY package-lock.json ./

RUN npm ci --omit=dev

FROM libreoffice AS runner

RUN chown -R node:node /home/file-converter

USER node

COPY tsconfig.json ./
COPY --from=dependencies /home/file-converter/node_modules ./node_modules
COPY --from=builder /home/file-converter/.build ./.build

EXPOSE 8020

CMD ["npm", "run", "start:prod"]
