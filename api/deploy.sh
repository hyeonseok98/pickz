#!/bin/bash

EXIST_BLUE=$(docker ps | grep blue)

if [ -z "$EXIST_BLUE" ]; then
    TARGET_COLOR="blue"
    TARGET_PORT=8080
    CURRENT_COLOR="green"
    CURRENT_PORT=8081
else
    TARGET_COLOR="green"
    TARGET_PORT=8081
    CURRENT_COLOR="blue"
    CURRENT_PORT=8080
fi

echo ">> [$TARGET_COLOR] 배포 시작 (Port: $TARGET_PORT)"

docker compose pull app-$TARGET_COLOR
docker compose up -d app-$TARGET_COLOR

echo ">> Health Check 시작..."
for i in {1..10}
do
  RESPONSE=$(curl -s http://127.0.0.1:$TARGET_PORT/actuator/health)
  if echo "$RESPONSE" | grep -q "UP"; then
    echo ">> Health Check 성공!"
    break
  fi
  echo ">> 대기 중... ($i/10)"
  sleep 5
  if [ $i -eq 10 ]; then
    echo ">> 배포 실패. 새 컨테이너를 제거합니다."
    docker compose stop app-$TARGET_COLOR
    exit 1
  fi
done

echo "set \$service_url http://127.0.0.1:$TARGET_PORT;" | sudo tee /etc/nginx/conf.d/service-url.inc
sudo systemctl reload nginx
echo ">> Nginx 트래픽 전환 완료"

echo ">> 기존 버전($CURRENT_COLOR) 컨테이너 종료"
docker compose stop app-$CURRENT_COLOR
docker compose rm -f app-$CURRENT_COLOR
docker image prune -af

echo ">> 무중단 배포 완료"