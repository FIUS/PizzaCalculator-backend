FROM node:8.15-alpine

ENV PORT=8080
ENV TIMEOUT_IN_MS=28800000

COPY package.json tsconfig.json ./
RUN npm install

COPY . ./
ADD src/data/database/ingredients.template.json src/data/database/ingredients.json
ADD src/data/database/templates.template.json src/data/database/templates.json

RUN npm run db-creation

EXPOSE 8080

CMD [ "npm", "run", "prod" ]
