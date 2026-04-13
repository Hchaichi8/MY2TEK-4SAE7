FROM amazoncorretto:17
EXPOSE 8083
ADD target/UserMicroService-0.0.1-SNAPSHOT.jar user-microservice.jar
ENTRYPOINT ["java", "-jar", "user-microservice.jar"]
