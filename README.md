# Shipping Microservice — MY2TEK

> Microservice de gestion des livraisons — Plateforme MY2TEK  
> 4SAE7 | Ayoub Somrani

---

## Description

Microservice Spring Boot responsable de la gestion complète du cycle de vie des livraisons :
création d'expéditions, suivi par numéro de tracking, mise à jour des statuts, gestion des retours,
audit log, et statistiques. Il communique avec MS Commandes via **OpenFeign** et publie des
événements de livraison via **RabbitMQ**. Les notifications sont envoyées par **email**.

---

## Stack

| Technologie | Usage |
|---|---|
| Java 17 + Spring Boot 4.0 | Framework principal |
| Spring Data JPA + MySQL 8 | Persistance |
| Spring Cloud OpenFeign | Appels inter-services |
| Spring AMQP + RabbitMQ | Messaging asynchrone |
| Spring Mail (Gmail SMTP) | Notifications email |
| Spring Cloud Eureka Client | Service discovery |
| Spring Cloud Config Client | Configuration centralisée |
| Docker | Conteneurisation |

---

## Structure

- ShippingMicroService/
  - config/
    - RabbitMQConfig.java — Queue, exchange, binding, JSON converter
    - GlobalExceptionHandler.java — Gestion centralisée des erreurs
    - DataSeeder.java — Données initiales (transporteurs)
  - controllers/
    - ShipmentController.java — REST API livraisons
    - CarrierController.java — REST API transporteurs
    - StatisticsController.java — REST API statistiques
    - WelcomeController.java
  - dto/
    - CreateShipmentRequest.java
    - UpdateStatusRequest.java
    - ReturnShipmentRequest.java
    - ShipmentDeliveredEvent.java
    - ShippingStatsDto.java
  - entities/
    - Shipment.java — Entité livraison
    - Carrier.java — Entité transporteur
    - ShipmentAuditLog.java — Historique des changements de statut
    - ShipmentStatus.java — Enum statuts
  - feign/
    - CommandeClient.java — Appel MS Commandes
    - CommandeClientFallback.java
    - UserServiceClient.java — Appel User Microservice
    - FeignConfig.java
  - messaging/
    - ShipmentEventProducer.java — Publication événements RabbitMQ
  - services/
    - ShippingService.java
    - CarrierService.java
    - NotificationService.java — Envoi d'emails
    - DeliveryEstimationService.java
    - StatisticsService.java
  - resources/
    - application.properties

---

## Statuts de livraison

Flux normal :
- READY_TO_SHIP → SHIPPED → IN_TRANSIT → DELIVERED

Flux retour :
- RETURN_REQUESTED → RETURN_SHIPPED → RETURNED

---

## API Endpoints — Livraisons

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/shipments` | Créer une livraison |
| `GET` | `/shipments` | Lister toutes les livraisons |
| `GET` | `/shipments/{id}` | Détail d'une livraison |
| `GET` | `/shipments/track/{trackingNumber}` | Suivi par numéro de tracking |
| `GET` | `/shipments/order/{orderId}` | Livraisons d'une commande |
| `GET` | `/shipments/status/{status}` | Livraisons par statut |
| `PUT` | `/shipments/{id}` | Modifier une livraison |
| `PUT` | `/shipments/{id}/status` | Changer le statut |
| `POST` | `/shipments/return` | Demander un retour |
| `GET` | `/shipments/{id}/history` | Historique des statuts |
| `GET` | `/shipments/track/{trackingNumber}/history` | Historique par tracking |
| `DELETE` | `/shipments/{id}` | Supprimer une livraison |

## API Endpoints — Transporteurs

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/carriers` | Lister les transporteurs |
| `GET` | `/carriers/{id}` | Détail d'un transporteur |
| `POST` | `/carriers` | Créer un transporteur |
| `PUT` | `/carriers/{id}` | Modifier un transporteur |
| `DELETE` | `/carriers/{id}` | Supprimer un transporteur |

---

## Messaging RabbitMQ

### Producteur

| Événement | Exchange | Routing Key | Queue |
|---|---|---|---|
| Livraison livrée | `shipment.exchange` | `shipment.delivered` | `shipment.delivered.queue` |

---

## Configuration

### Variables d'environnement (Docker)


SPRING_DATASOURCE_URL=jdbc:mysql://mysqldb:3306/MY2TEK_shipping_db
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root

SPRING_RABBITMQ_HOST=rabbitmq
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=guest
SPRING_RABBITMQ_PASSWORD=guest

SPRING_CONFIG_IMPORT=optional:configserver:http://config-server:8888

### Ports
Service	|Port
Shipping Microservice	| 8091
MySQL	| 3307 (host) → 3306 (container)
RabbitMQ	| 5672 / 15672
# Lancer en local
- Avec Docker Compose (depuis la racine du projet)
docker-compose up --build shipping-microservice
- Sans Docker (dev local)
- S'assurer que MySQL et RabbitMQ tournent localement, puis :

cd ShippingMicroService
./mvnw spring-boot:run

## Dépendances inter-services

Shipping Microservice

→ MS Commandes — OpenFeign : récupération des détails de commande
→ User Microservice — OpenFeign : récupération des infos destinataire
→ Config Server — configuration centralisée
→ Eureka Server — service discovery
→ RabbitMQ — publication événements livraison confirmée
→ Gmail SMTP — notifications email au destinataire
