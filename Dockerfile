FROM node:21 AS ng-builder

RUN npm i -g @angular/cli

WORKDIR /ngapp

COPY client/package*.json .

RUN npm ci

COPY client/ ./

RUN ng build --configuration production

FROM maven:eclipse-temurin AS sb-builder

WORKDIR /sbapp

COPY server/server/mvnw .
COPY server/server/mvnw.cmd .
COPY server/server/.mvn .mvn
COPY server/server/src src
COPY server/server/pom.xml .
COPY --from=ng-builder /ngapp/dist/client/browser /sbapp/src/main/resources/static

RUN mvn clean package -Dmaven.test.skip=true

# Publish stage

FROM openjdk:21-jdk-slim

WORKDIR /app

COPY --from=sb-builder /sbapp/target/server-0.0.1-SNAPSHOT.jar ./app.jar


ENV SPRING_DATA_MONGODB_URI= 
ENV SPRING_DATASOURCE_USERNAME = 
ENV SPRING_DATASOURCE_PASSWORD = 
ENV SPRING_DATASOURCE_URL=
ENV SPRING_DATASOURCE_DATABASE=
ENV SPRING_DATASOURCE_PORT=
ENV MAILGUN_API_KEY=
ENV MAILGUN_DOMAIN=
ENV STRIPE_API_KEY=
ENV SERVER_API_URL=
ENV CORS_ALLOWEDORIGINS=

ENV PORT=8080

EXPOSE ${PORT}

ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]