FROM node:20-alpine as backend-builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Stage 2: Backend production image
FROM node:20-alpine as backend

WORKDIR /app
COPY --from=backend-builder /app/package.json /app/yarn.lock ./
COPY --from=backend-builder /app/dist ./dist

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Environment variables
ENV BACKEND_PORT=3040
ENV BACKEND_IP=0.0.0.0
ENV NODE_ENV=production

EXPOSE 3040
CMD ["node", "dist/main"]
