# 🚀 MY2TEK — Plateforme Microservices

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue?style=for-the-badge)
![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-green?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge)

> Architecture microservices complète basée sur **Spring Boot**, intégrant **sécurité robuste**, **communication asynchrone** et **orchestration via Docker**.

---

## 👨‍💻 Groupe 4SAE7

| Membres |
|---------|
| 👤 Islem Bouchaala |
| 👤 Hazem Ouasli |
| 👤 Ghassen Hachaichi |
| 👤 Amna Gaied |
| 👤 Ayoub Somrani |

---

## 🧩 Architecture Globale

```
                    ┌─────────────────┐
                    │   API Gateway   │  :8085
                    │  (Spring Cloud) │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼──────┐    ┌───────▼────┐    ┌──────────▼───┐
   │ MS Cmds   │    │ User Svc   │    │ Product Svc  │
   │  :8090    │    │   :8083    │    │    :8086     │
   └───────────┘    └────────────┘    └──────────────┘
        │
   ┌────▼──────────────────────────────────────┐
   │ MS Competence & Review :8084             │
   │ Shipping Microservice  :8091             │
   └─────────────────────────────────────────┘

┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Eureka :8761 │   │ Config :8888 │   │Keycloak:8100 │
└──────────────┘   └──────────────┘   └──────────────┘

┌──────────────┐   ┌──────────────┐
│ MySQL :3307  │   │RabbitMQ:5672 │
└──────────────┘   └──────────────┘
```

---

## 🛠️ Stack Technique

| Composant | Version |
|-----------|---------|
| ☕ **Java** | 17+ |
| 🍃 **Spring Boot** | 3.4 |
| ☁️ **Spring Cloud** | 2024 |
| 🔐 **Security** | OAuth2 + JWT (Keycloak) |
| 📩 **Messaging** | RabbitMQ (AMQP) |
| 🐬 **Database** | MySQL 8 |
| ⚡ **Resilience** | Resilience4j (Circuit Breaker) |
| 📄 **API Docs** | Swagger / OpenAPI |
| 🐳 **Containerization** | Docker & Docker Compose |

**Frameworks clés :**
- ✅ Eureka (Service Discovery)
- ✅ Config Server (Configuration centralisée)
- ✅ API Gateway (Point d'entrée unique)
- ✅ OpenFeign (Communication synchrone)
- ✅ Spring Security + Keycloak (Authentification)

---

## ⚙️ Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| 🔍 Eureka Server | 8761 | Service discovery & registry |
| ⚙️ Config Server | 8888 | Configuration centralisée |
| 🌐 API Gateway | 8085 | Point d'entrée unique |
| 📦 MS Commandes | 8090 | Gestion des commandes |
| 👥 User Service | 8083 | Gestion des utilisateurs |
| 🛍️ Product Service | 8086 | Gestion des produits |
| ⭐ Competence & Review | 8084 | Gestion des avis & compétences |
| 🚚 Shipping Service | 8091 | Gestion des livraisons |
| 🔐 Keycloak | 8100 | Authentification & SSO |
| 🗄️ MySQL | 3307 | Base de données principale |
| 📨 RabbitMQ | 5672 / 15672 | Message Broker |

---

## 🚀 Démarrage du Projet

### 📌 Prérequis

```bash
✅ Docker installé (v20.10+)
✅ Docker Compose installé (v1.29+)
✅ Git installé
✅ ~4GB de RAM disponible
```

### ▶️ Installation & Lancement

```bash
# 1. Cloner le projet
git clone https://github.com/Hchaichi8/MY2TEK-4SAE7.git
cd MY2TEK-4SAE7

# 2. Démarrer tous les services
docker-compose up --build

# 3. Attendre que tous les services soient prêts (~2-3 minutes)
```

✨ **Tous les services démarrent automatiquement** avec `depends_on` et `healthchecks` !

---

## 🌐 Accès aux Interfaces

| Interface | URL | Description |
|-----------|-----|-------------|
| 📊 **Eureka Dashboard** | http://localhost:8761 | Service Discovery |
| 🌍 **API Gateway** | http://localhost:8085 | Point d'entrée API |
| 🐰 **RabbitMQ Dashboard** | http://localhost:15672 | Message Management |
| 🔐 **Keycloak Admin** | http://localhost:8100 | Identity Management |
| 📄 **Swagger Commandes** | http://localhost:8090/swagger-ui.html | API Documentation |

### 🔑 Credentials par défaut

```
🐰 RabbitMQ       → user: guest / password: guest
🔐 Keycloak Admin → user: admin / password: admin
```

---

## 🔐 Sécurité (Keycloak)

### Configuration Realm

**Realm Name:** `MY2TEK-realm`

### Rôles & Permissions

| Rôle | Permissions | Description |
|------|-----------|-------------|
| 👑 **admin** | CRUD + DELETE | Accès administrateur complet |
| 👤 **user** | GET + POST | Accès utilisateur standard |

### Validation des JWT

```
✔️ Validation effectuée via : realm_access.roles
✔️ Scope : Token JWT bearer
✔️ Issuer : http://localhost:8100/realms/MY2TEK-realm
```

---

## 📦 MS Commandes — Fonctionnalités Détaillées

### ✨ Capacités

- ✅ **CRUD Complet** des commandes
- 🔄 **Gestion des Statuts** (StatutCommande)
- 🔗 **Communication OpenFeign**
  - Vérification utilisateur
  - Vérification produit
- ⚡ **Circuit Breaker** avec Resilience4j
- 📩 **Événements RabbitMQ**
  ```
  - commandes.queue
  - commandes.cancelled.queue
  ```
- 🔐 **Sécurité Granulaire**
  - DELETE → réservé au rôle `admin` uniquement

---

## 📁 Structure du Projet

```
MY2TEK-4SAE7/
├── 🌐 apigateway/              # API Gateway
├── ⚙️ config-server/            # Configuration centralisée
├── 🔍 eureka/                   # Service Discovery
├── 📦 MS_Commandes/             # Microservice Commandes
├── 👥 UserMicroService/         # Microservice Utilisateurs
├── 🛍️ Product-MS/               # Microservice Produits
├── ⭐ MS_CompetenceAndReview/  # Reviews & Compétences
├── 🚚 ShippingMicroService/     # Service Logistique
├── 🔐 data/keycloak/            # Configuration Keycloak
├── 🐳 docker-compose.yml        # Orchestration Docker
└── 📄 README.md                 # Ce fichier
```

---

## 💡 Patterns & Principes Implémentés

### Communication

```
┌─────────────────────────────────────┐
│ Synchrone (OpenFeign)               │
│ └─ Communication temps réel         │
│ └─ Requêtes/Réponses               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Asynchrone (RabbitMQ)               │
│ └─ Événements découplés             │
│ └─ Queues persistantes             │
└─────────────────────────────────────┘
```

### Résilience

- 🛡️ **Circuit Breaker** (Resilience4j)
- ⏱️ **Timeouts configurables**
- 🔄 **Retry logic automatique**

### Sécurité

- 🔐 **OAuth2 + JWT**
- 👤 **Authentification centralisée (Keycloak)**
- 🔑 **Role-Based Access Control (RBAC)**

---

## 🔄 Flux de Communication Exemple

```
Client
  │
  ├─→ API Gateway (8085)
  │     │
  │     ├─[OpenFeign]→ User Service (8083)
  │     │
  │     ├─[OpenFeign]→ Product Service (8086)
  │     │
  │     └─[Async]→ RabbitMQ
  │              │
  │              └─→ MS Commandes (8090)
  │
  └─ JWT Token validé via Keycloak
```

---

## 🔧 Configuration Avancée

### RabbitMQ Queues

```yaml
commandes.queue:
  - Réception des nouvelles commandes
  - Persistance durable

commandes.cancelled.queue:
  - Annulation de commandes
  - Traitement asynchrone
```

### Resilience4j Configuration

```yaml
circuitBreaker:
  failureThreshold: 50%
  waitDuration: 30000ms
  slowCallDuration: 2000ms
```

---

## 📌 Améliorations Futures

| Objectif | Priorité | Status |
|----------|----------|--------|
| 🔄 **CI/CD (GitHub Actions)** | ⭐⭐⭐ | 📋 Planifié |
| 📊 **Monitoring (Prometheus + Grafana)** | ⭐⭐⭐ | 📋 Planifié |
| 🧠 **Logs centralisés (ELK Stack)** | ⭐⭐ | 📋 Planifié |
| ☸️ **Déploiement Kubernetes** | ⭐⭐ | 📋 Planifié |
| 🧪 **Test Coverage (JUnit5)** | ⭐⭐ | 📋 Planifié |
| 📈 **API Rate Limiting** | ⭐ | 📋 Planifié |

---

## 🐛 Troubleshooting

### Service ne démarre pas ?

```bash
# Vérifier les logs
docker-compose logs -f service-name

# Redémarrer un service spécifique
docker-compose restart service-name

# Nettoyer et recommencer
docker-compose down -v
docker-compose up --build
```

### Port déjà utilisé ?

```bash
# Trouver le processus
lsof -i :8085

# Tuer le processus
kill -9 <PID>
```

---

## 📚 Documentation Supplémentaire

- 🔗 [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- 🔗 [Spring Cloud Netflix](https://spring.io/projects/spring-cloud-netflix)
- 🔗 [Keycloak Documentation](https://www.keycloak.org/documentation)
- 🔗 [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- 🔗 [Docker Documentation](https://docs.docker.com/)

---

## ⭐ Conclusion

**MY2TEK** est une **plateforme microservices complète** qui démontre :

✔️ **Architecture moderne & scalable**  
✔️ **Sécurité robuste & centralisée**  
✔️ **Communication distribuée fiable**  
✔️ **Déploiement containerisé simplifié**  
✔️ **Patterns cloud-native**  

---

## 📞 Support & Questions

Pour des questions ou issues :
- 📧 Ouvrir une [Issue GitHub](https://github.com/Hchaichi8/MY2TEK-4SAE7/issues)
- 💬 Discuter dans les [Discussions](https://github.com/Hchaichi8/MY2TEK-4SAE7/discussions)

---

<div align="center">

**Made with ❤️ by 4SAE7 Team**

⭐ Si ce projet vous a été utile, n'hésitez pas à mettre une star ! ⭐

</div>