FROM node:11-alpine

RUN apk --no-cache --virtual build-dependencies add python make g++

COPY /topix/ /topix/

WORKDIR /topix/

RUN npm install

EXPOSE $API_PORT

COPY entrypoint.sh /topix/entrypoint.sh
RUN chmod +x /topix/entrypoint.sh

ENTRYPOINT ["/topix/entrypoint.sh"]
