FROM node
LABEL org.opencontainers.image.source="https://github.com/defiantlabs/cosmos-tax-cli-web"
WORKDIR /app
ADD . .
RUN npm install
CMD [ "npm", "run", "start" ]