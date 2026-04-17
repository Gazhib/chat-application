FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_APP_DF_PORT=http://localhost:3000
ARG VITE_APP_AUTH_PORT=http://localhost:4000

ENV VITE_APP_DF_PORT=$VITE_APP_DF_PORT
ENV VITE_APP_AUTH_PORT=$VITE_APP_AUTH_PORT

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

FROM nginx:1.27-alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
