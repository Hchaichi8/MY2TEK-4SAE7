# MS Competence & Review — MY2TEK

> Microservice de gestion des avis et compétences — Plateforme MY2TEK  
> 4SAE7 | Amna Gaied 

---

## Description

Microservice Spring Boot responsable de la gestion des avis clients sur les produits.
Il intègre une fonctionnalité d'amélioration de texte via **Gemini AI**, récupère les informations
utilisateur via **OpenFeign**, publie des événements de création d'avis via **RabbitMQ**,
et écoute les mises à jour de profil utilisateur pour synchroniser les noms en base.

---

## Stack

| Technologie | Usage |
|---|---|
| Java 17 + Spring Boot 4.0 | Framework principal |
| Spring Data JPA + MySQL 8 | Persistance |
| Spring Cloud OpenFeign | Appels inter-services |
| Spring AMQP + RabbitMQ | Messaging asynchrone (producteur + consommateur) |
| Gemini AI API | Amélioration automatique du texte d'avis |
| Apache PDFBox 2.0 | Génération de PDF |
| Spring Cloud Eureka Client | Service discovery |
| Spring Cloud Config Client | Configuration centralisée |
| Lombok | Réduction du boilerplate |
| Docker | Conteneurisation |

---

## Structure

- MS_CompetenceAndReview/
  - Config/
    - RabbitMQConfig.java — Queues, exchanges, bindings (review + user)
    - RabbitMQConsumer.java — Consommateur : mise à jour du nom client dans les avis
  - Controllers/
    - ReviewController.java — REST API avis
  - DTO/
    - UserDTO.java
  - Entities/
    - Review.java — Entité avis (description, rating, clientId, clientName, productId)
  - OpenFeign/
    - UserClient.java — Appel User Microservice
  - Repositories/
    - ReviewRepo.java
  - Services/
    - Interface/ReviewService.java
    - Impl/ReviewServiceImpl.java — Logique métier + intégration Gemini AI
  - resources/
    - application.properties

---

## Modèle Review

| Champ | Type | Description |
|---|---|---|
| id | Long | Identifiant auto-généré |
| description | String | Texte de l'avis (5 à 5000 caractères) |
| rating | Integer | Note de 1 à 5 |
| clientId | String | Keycloak ID de l'auteur |
| clientName | String | Nom complet (résolu via OpenFeign) |
| productId | String | Identifiant du produit concerné |
| createdAt | LocalDateTime | Date de création |
| updatedAt | LocalDateTime | Date de dernière modification |

---

## API Endpoints

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/Review/AjouterReview` | Créer un avis (+ résolution nom + event RabbitMQ) |
| `GET` | `/Review/GetAllReview` | Lister tous les avis |
| `GET` | `/Review/GetReview/{id}` | Détail d'un avis |
| `GET` | `/Review/GetReviewsByClient/{id}` | Avis d'un client par keycloakId |
| `PUT` | `/Review/UpdateMyReview/{id}` | Modifier un avis |
| `DELETE` | `/Review/DeleteMyReview/{id}` | Supprimer un avis |
| `POST` | `/Review/enhance` | Améliorer un texte d'avis via Gemini AI |

### Exemple `/Review/enhance`


{
  "text": "produit correct",
  "rating": 4
}
Retourne :

{
  "enhancedText": "Produit de bonne qualité, répond bien aux attentes..."
}

## Messaging RabbitMQ
# Producteur
Événement	Exchange	Routing Key	Déclencheur
Avis créé	review.exchange	review.created	POST /Review/AjouterReview

# Consommateur
Queue	Routing Key	Source	Action
user.queue	user.updated	User Microservice	Met à jour clientName dans tous les avis de l'utilisateur

## Configuration
Variables d'environnement (Docker)
SPRING_DATASOURCE_URL=jdbc:mysql://mysqldb:3306/MY2TEK_competence_db
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root

SPRING_RABBITMQ_HOST=rabbitmq
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=guest
SPRING_RABBITMQ_PASSWORD=guest

SPRING_CONFIG_IMPORT=optional:configserver:http://config-server:8888
### Ports
Service	|Port
MS Competence & Review	| 8084
MySQL	| 3307 (host) → 3306 (container)
RabbitMQ	| 5672 / 15672
# Lancer en local
-Avec Docker Compose (depuis la racine du projet)
docker-compose up --build ms-competence-review
-Sans Docker (dev local)
S'assurer que MySQL et RabbitMQ tournent localement, puis :

cd MS_CompetenceAndReview
./mvnw spring-boot:run

# Dépendances inter-services

MS Competence & Review
→ User Microservice — OpenFeign : résolution du nom client lors de la création d'un avis
← User Microservice — RabbitMQ consumer : synchronisation du nom si profil modifié
→ User Microservice — RabbitMQ producer : publication événement avis créé
→ Config Server — configuration centralisée
→ Eureka Server — service discovery
→ Gemini AI API — amélioration du texte d'avis
