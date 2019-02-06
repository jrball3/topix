FROM node:11-alpine

RUN apk --no-cache --virtual build-dependencies add python make g++

COPY /topix/package.json /topix/package.json
COPY /topix/package-lock.json /topix/package-lock.json

WORKDIR /topix/

RUN npm install

COPY /topix/ /topix/

EXPOSE $API_PORT

COPY entrypoint.sh /topix/entrypoint.sh
RUN chmod +x /topix/entrypoint.sh

ENTRYPOINT ["/topix/entrypoint.sh"]
