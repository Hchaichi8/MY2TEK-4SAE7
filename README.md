# User Microservice — MY2TEK

> Microservice de gestion des utilisateurs — Plateforme MY2TEK  
> 4SAE7 |  Ghassen Hachaichi 
---

## Description

Microservice Spring Boot responsable de la gestion des profils utilisateurs.
Il synchronise les utilisateurs depuis **Keycloak**, gère les profils locaux en base MySQL,
communique avec d'autres microservices via **OpenFeign** et publie des événements via **RabbitMQ**.

---

## Stack

| Technologie | Usage |
|---|---|
| Java 17 + Spring Boot 3.4 | Framework principal |
| Spring Data JPA + MySQL 8 | Persistance |
| Spring Security + OAuth2 JWT | Authentification Keycloak |
| Keycloak Admin Client 24 | Gestion admin des utilisateurs Keycloak |
| Spring AMQP + RabbitMQ | Messaging asynchrone |
| Spring Cloud OpenFeign | Appels inter-services |
| Spring Mail | Envoi d'emails |
| Google API Client | Authentification Google OAuth |
| Docker | Conteneurisation |

---

## Structure

- UserMicroService/
  - Config/
    - SecurityConfig.java — JWT Keycloak + règles d'autorisation
    - RabbitMQConfig.java — Queues, exchanges, bindings
    - RabbitMQConsumer.java — Consommateur d'événements RabbitMQ
  - Controllers/
    - UserController.java — REST API
  - DTO/
    - UserDTO.java
    - UserSyncRequest.java
  - Entities/
    - User.java — Entité utilisateur (keycloakId, firstName, lastName, email, role...)
    - Role.java — Enum : CLIENT, ADMIN
  - OpenFeign/
    - ReviewClient.java — Appel MS Competence & Review
  - Repositories/
    - UserRepository.java
  - Services/
    - UserService.java
    - UserServiceImpl.java
    - KeycloakAdminService.java — CRUD utilisateurs via Keycloak Admin API
  - resources/
    - application.properties

---

## API Endpoints

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/users/sync` | JWT requis | Synchroniser le profil depuis le token Keycloak |
| `GET` | `/users/me` | JWT requis | Récupérer son propre profil (auto-sync) |
| `PUT` | `/users/me` | JWT requis | Mettre à jour son profil |
| `GET` | `/users/me/reviews` | JWT requis | Profil + avis via OpenFeign |
| `GET` | `/users/feign/{keycloakId}` | Public | Endpoint interne pour OpenFeign |
| `GET` | `/users` | Public | Lister tous les utilisateurs |
| `GET` | `/users/keycloak/all` | Public | Lister tous les users depuis Keycloak |
| `PUT` | `/users/{keycloakId}` | Public | Modifier un utilisateur (admin) |
| `DELETE` | `/users/{keycloakId}` | Public | Supprimer un utilisateur |

---

## Messaging RabbitMQ

### Producteur

| Événement | Exchange | Routing Key | Déclencheur |
|---|---|---|---|
| Profil mis à jour | `user.exchange` | `user.updated` | `PUT /users/me` |

### Consommateur

| Queue | Routing Key | Source |
|---|---|---|
| `review.queue` | `review.created` | MS Competence & Review |

---

## Sécurité

- Authentification via **Keycloak** (realm `MY2TEK-realm`)
- Tokens JWT validés via `jwk-set-uri`
- Gestion admin des utilisateurs via **Keycloak Admin Client** (realm `master`, client `admin-cli`)
- Synchronisation automatique du profil local à chaque connexion

---

## Configuration

### Variables d'environnement (Docker)


SPRING_DATASOURCE_URL=jdbc:mysql://mysqldb:3306/MY2TEK_user_db
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root

SPRING_RABBITMQ_HOST=rabbitmq
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=guest
SPRING_RABBITMQ_PASSWORD=guest

SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI=http://keycloak:8080/realms/MY2TEK-realm
SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI=http://keycloak:8080/realms/MY2TEK-realm/protocol/openid-connect/certs

KEYCLOAK_ADMIN_SERVER_URL=http://keycloak:8080

SPRING_CONFIG_IMPORT=optional:configserver:http://config-server:8888


### Ports
Service	|Port
User Microservice |	8083
MySQL	| 3307 (host) → 3306 (container)
RabbitMQ	| 5672 / 15672
Keycloak	|8100

## Lancer en local
- Avec Docker Compose (depuis la racine du projet)
docker-compose up --build user-microservice
- Sans Docker (dev local)
- S'assurer que MySQL, RabbitMQ et Keycloak tournent localement, puis :

cd UserMicroService
./mvnw spring-boot:run
# Dépendances inter-services
User Microservice
→ ReviewMicroService — OpenFeign : récupération des avis d'un utilisateur
→ Config Server — configuration centralisée
→ Eureka Server — service discovery
→ RabbitMQ — publication événements mise à jour profil
→ Keycloak — validation JWT + gestion admin des comptes
