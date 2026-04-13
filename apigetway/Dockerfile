FROM amazoncorretto:17
EXPOSE 8085
ADD target/apigetway-0.0.1-SNAPSHOT.jar api-gateway.jar
ENTRYPOINT ["java", "-jar", "api-gateway.jar"]
