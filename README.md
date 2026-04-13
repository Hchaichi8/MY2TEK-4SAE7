🚀 MY2TEK — Plateforme Microservices

Architecture microservices complète basée sur Spring Boot, intégrant sécurité, communication asynchrone et orchestration via Docker.

👨‍💻 Groupe 4SAE7

Islem Bouchaala
Hazem Ouasli
Ghassen Hachaichi
Amna Gaied
Ayoub Somrani
🧩 Architecture Globale
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
┌─────────▼──────────────────────────────────────────────┐
│  MS Competence & Review :8084                         │
│  Shipping Microservice   :8091                         │
└───────────────────────────────────────────────────────┘

┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Eureka :8761 │   │ Config :8888 │   │ Keycloak:8100│
└──────────────┘   └──────────────┘   └──────────────┘

┌──────────────┐   ┌──────────────┐
│ MySQL :3307  │   │ RabbitMQ:5672│
└──────────────┘   └──────────────┘
🛠️ Stack Technique
☕ Java 17 + Spring Boot 3.4
☁️ Spring Cloud 2024
Eureka (Service Discovery)
Config Server
API Gateway
OpenFeign
🔐 Spring Security + OAuth2 + JWT (Keycloak)
📩 RabbitMQ (AMQP) — communication asynchrone
🐬 MySQL 8
⚡ Resilience4j — Circuit Breaker
📄 Swagger / OpenAPI
🐳 Docker & Docker Compose
⚙️ Services & Ports
Service	Port	Description
Eureka Server	8761	Service discovery
Config Server	8888	Configuration centralisée
API Gateway	8085	Point d’entrée unique
MS Commandes	8090	Gestion des commandes
User Service	8083	Gestion des utilisateurs
Product Service	8086	Gestion des produits
Competence & Review	8084	Gestion des avis
Shipping Service	8091	Gestion des livraisons
Keycloak	8100	Authentification
MySQL	3307	Base de données
RabbitMQ	5672 / 15672	Messaging
🚀 Lancement du Projet
📌 Prérequis
Docker installé
Docker Compose installé
▶️ Démarrage
docker-compose up --build

✔️ Tous les services démarrent automatiquement avec depends_on et healthchecks.

🌐 Accès aux Interfaces
Interface	URL
Eureka Dashboard	http://localhost:8761

API Gateway	http://localhost:8085

RabbitMQ Management	http://localhost:15672

Keycloak Admin	http://localhost:8100

Swagger Commandes	http://localhost:8090/swagger-ui.html

🔑 RabbitMQ Login : guest / guest
🔑 Keycloak Admin : admin / admin

🔐 Sécurité (Keycloak)
Configuration

Créer un realm :

MY2TEK-realm
Rôles
👑 admin → accès complet (CRUD + DELETE)
👤 user → accès standard

✔️ Les JWT sont validés via :

realm_access.roles
📦 MS Commandes — Fonctionnalités
✅ CRUD des commandes
🔄 Gestion des statuts (StatutCommande)
🔗 Communication via OpenFeign
Vérification utilisateur
Vérification produit
⚡ Circuit Breaker avec Resilience4j
📩 Publication d’événements RabbitMQ :
commandes.queue
commandes.cancelled.queue
🔐 Sécurité :
DELETE → réservé au rôle admin
📁 Structure du Projet
├── apigetway/              
├── config-server/          
├── eureka/                 
├── MS_Commandes/           
├── UserMicroService/       
├── Product-MS/             
├── MS_CompetenceAndReview/ 
├── ShippingMicroService/   
├── data/keycloak/          
└── docker-compose.yml
💡 Points Clés
Architecture scalable et découplée
Communication :
Synchrone → OpenFeign
Asynchrone → RabbitMQ
Sécurité centralisée avec Keycloak
Déploiement simplifié via Docker
📌 Améliorations Futures
🔄 CI/CD (GitHub Actions)
📊 Monitoring (Prometheus + Grafana)
🧠 Logs centralisés (ELK Stack)
☸️ Déploiement Kubernetes
⭐ Conclusion

MY2TEK est une plateforme microservices complète illustrant :

✔️ Architecture moderne
✔️ Sécurité robuste
✔️ Communication distribuée
✔️ Déploiement containerisé
