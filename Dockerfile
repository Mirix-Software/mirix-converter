FROM node:22-alpine as backend-builder

WORKDIR /workspace/backend
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build
RUN apk add --no-cache \
    ffmpeg

RUN chown -R node:node /workspace/backend

USER node

EXPOSE 8000

CMD ["npm", "run", "start:prod"]
