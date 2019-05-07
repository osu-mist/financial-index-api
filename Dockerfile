FROM node:10.13

RUN apt-get update && apt-get install -y libaio1 unzip

RUN mkdir -p /usr/src/financial-index-api /opt/oracle

# Copy folder to workspace
WORKDIR /usr/src/financial-index-api
COPY . /usr/src/financial-index-api

# Install dependent packages via yarn
RUN yarn

# Unzip and setup Oracle instantclient
RUN unzip bin/instantclient-basiclite-linux.x64-12.2.0.1.0.zip -d /opt/oracle

RUN cd /opt/oracle/instantclient_12_2 \
 && ln -s libclntsh.so.12.1 libclntsh.so \
 && ln -s libocci.so.12.1 libocci.so

RUN echo /opt/oracle/instantclient_12_2 > /etc/ld.so.conf.d/oracle-instantclient.conf \
 && ldconfig

# Run unit tests
RUN ./node_modules/.bin/gulp test
USER nobody:nogroup

# Run application
ENTRYPOINT ["./node_modules/.bin/gulp", "run"]
