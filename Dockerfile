FROM node:12 as buildContainer
WORKDIR /app

ARG GITHUB_TOKEN_ARG
ENV GITHUB_TOKEN=$GITHUB_TOKEN_ARG

COPY ./package.json ./package-lock.json ./.npmrc /app/
RUN npm install
COPY . /app
# max-old-space is needed to avoid any compilation issues because of missing memory
ENV NODE_OPTIONS --max-old-space-size=2048
RUN npm run build:ssr

FROM node:12-alpine

WORKDIR /app
COPY --from=buildContainer /app/package.json /app

# Get all the code needed to run the app
COPY --from=buildContainer /app/dist /app/dist

EXPOSE 4000

ENV NODE_ENV production
CMD ["npm", "run", "serve:ssr"]