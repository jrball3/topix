. sourceme
docker-compose build && docker-compose up -d --force-recreate
docker exec -e WAIT_HOSTS=localhost:3000 -it backend_api_1 sh -c "/wait && npm test"
docker logs backend_api_1 > test-output.log
docker-compose down
