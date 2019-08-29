IMAGE_NAME=topix-api
REGISTRY_URL=us.gcr.io/prismatic-cider-250922/topix-api

docker build -t ${IMAGE_NAME} --no-cache .
docker tag topix-api ${REGISTRY_URL}
docker push ${REGISTRY_URL}
