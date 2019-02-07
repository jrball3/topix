FROM node:11-alpine

RUN apk --no-cache --virtual build-dependencies add python make g++

COPY /topix/package.json /topix/package.json
COPY /topix/package-lock.json /topix/package-lock.json

WORKDIR /topix/

RUN npm install

COPY /topix/ /topix/

EXPOSE 3000

COPY entrypoint.sh /topix/entrypoint.sh
RUN chmod +x /topix/entrypoint.sh

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

ENTRYPOINT ["/topix/entrypoint.sh"]
