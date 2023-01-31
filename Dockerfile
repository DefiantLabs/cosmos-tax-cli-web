FROM node:19-alpine3.16
LABEL org.opencontainers.image.source="https://github.com/defiantlabs/cosmos-tax-cli-web"
WORKDIR /app
COPY . .
RUN npm install
CMD [ "npm", "run", "start" ]
