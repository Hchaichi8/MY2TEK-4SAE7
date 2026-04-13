# MY2TEK — Plateforme Microservices

Architecture microservices Spring Boot avec Keycloak, RabbitMQ, MySQL et Docker.

4SAE7 - Groupe: Islem Bouchaala - Hazem Ouasli - Ghassen Hachaichi - Amna Gaied - Ayoub Somrani

## Architecture

                    ┌─────────────────┐
                    │   API Gateway   │  :8085
                    │  (Spring Cloud) │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
┌─────────▼──────┐  ┌────────▼───────┐  ┌──────▼──────────────┐
│  MS Commandes  │  │ User Service   │  │  Product Service    │
│    :8090       │  │    :8083       │  │      :8086          │
└────────────────┘  └────────────────┘  └─────────────────────┘
          │
┌─────────▼──────────────────────────────────────┐
│              MS Competence & Review  :8084      │
│              Shipping Microservice   :8091      │
└─────────────────────────────────────────────────┘

┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Eureka :8761 │   │Config :8888  │   │Keycloak:8100 │
└──────────────┘   └──────────────┘   └──────────────┘
┌──────────────┐   ┌──────────────┐
│ MySQL  :3307 │   │RabbitMQ:5672 │
└──────────────┘   └──────────────┘

## Services

| Service | Port | Description |
|---|---|---|
| Eureka Server | 8761 | Service discovery |
| Config Server | 8888 | Configuration centralisée |
| API Gateway | 8085 | Point d'entrée unique |
| MS Commandes | 8090 | Gestion des commandes |
| User Microservice | 8083 | Gestion des utilisateurs |
| Product Microservice | 8086 | Gestion des produits |
| MS Competence & Review | 8084 | Compétences et avis |
| Shipping Microservice | 8091 | Gestion des livraisons |
| Keycloak | 8100 | Authentification OAuth2/JWT |
| MySQL | 3307 | Base de données |
| RabbitMQ | 5672 / 15672 | Messaging asynchrone |

## Stack Technique

- Java 17 + Spring Boot 3.4
- Spring Cloud 2024 (Eureka, Config, Gateway, OpenFeign)
- Spring Security + OAuth2 Resource Server (Keycloak JWT)
- RabbitMQ (AMQP) — messaging entre microservices
- MySQL 8.0
- Resilience4j — circuit breaker sur les appels Feign
- Springdoc OpenAPI / Swagger UI
- Docker + Docker Compose

## Lancer le projet

### Prérequis

- Docker & Docker Compose installés

### Démarrage


docker-compose up --build
Tous les services démarrent dans l'ordre grâce aux depends_on et healthchecks.

Accès aux interfaces
Interface	URL
Eureka Dashboard	http://localhost:8761
RabbitMQ Management	http://localhost:15672 (guest/guest)
Keycloak Admin	http://localhost:8100 (admin/admin)
Swagger MS Commandes	http://localhost:8090/swagger-ui.html
API Gateway	http://localhost:8085
Configuration Keycloak
Créer un realm MY2TEK-realm avec les rôles :

admin — accès complet (suppression incluse)
user — accès CRUD standard
Les tokens JWT sont validés via realm_access.roles.

MS Commandes — Détails
CRUD commandes avec statuts (StatutCommande)
Vérification produit via Feign → ProductMicroService (avec fallback Resilience4j)
Vérification utilisateur via Feign → UserMicroService (avec fallback)
Publication d'événements RabbitMQ :
commandes.queue — commande livrée
commandes.cancelled.queue — commande annulée
Sécurité JWT Keycloak : DELETE réservé au rôle admin

## Structure du projet

├── apigetway/              # API Gateway (Spring Cloud Gateway)
├── config-server/          # Config Server (native, classpath:/configs/)
├── eureka/                 # Eureka Server
├── MS_Commandes/           # Microservice Commandes
├── UserMicroService/       # Microservice Utilisateurs
├── Product-MS/             # Microservice Produits
├── MS_CompetenceAndReview/ # Microservice Compétences & Avis
├── ShippingMicroService/   # Microservice Livraisons
├── data/keycloak/          # Données persistantes Keycloak
└── docker-compose.yml
