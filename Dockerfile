FROM node:8.11

# Copy folder to workspace
WORKDIR /usr/src/financial-index-api
COPY . /usr/src/financial-index-api

# Install dependent packages via yarn
RUN yarn

# Run unit tests
RUN ./node_modules/.bin/gulp test
USER nobody:nogroup

# Run application
ENTRYPOINT ["./node_modules/.bin/gulp", "run"]
