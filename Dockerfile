FROM node:20-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

# デバッグ: ビルド結果を確認
RUN echo "=== Build directory contents ===" && ls -la /app/dist/
RUN echo "=== Assets directory contents ===" && ls -la /app/dist/assets/ || echo "No assets directory found"
RUN echo "=== index.html contents ===" && cat /app/dist/index.html

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./default.conf /etc/nginx/conf.d/default.conf

# デバッグ: nginx内のファイルを確認
RUN ls -la /usr/share/nginx/html/
RUN ls -la /usr/share/nginx/html/assets/

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
