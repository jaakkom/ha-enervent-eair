ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN \ 
    apk add --no-cache \
        nodejs \
        npm \
    && mkdir /addon


# Copy data for add-on
COPY . /addon

WORKDIR /addon
RUN npm install
RUN chmod a+x /addon/run.sh

CMD [ "/addon/run.sh" ]