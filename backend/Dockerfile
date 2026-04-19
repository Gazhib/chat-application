FROM node:20-alpine AS dev

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend ./

EXPOSE 3000
EXPOSE 4000

CMD ["npm", "run", "dev"]

FROM node:20-alpine AS prod

ENV NODE_ENV=production

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend ./

EXPOSE 3000
EXPOSE 4000

CMD ["npm", "run", "start"]
