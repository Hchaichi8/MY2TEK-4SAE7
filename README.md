# Product Microservice — MY2TEK

> Microservice de gestion des produits — Plateforme MY2TEK  
> 4SAE7 |  Hazem Ouasli 

---

## Description

Microservice Spring Boot responsable de la gestion du catalogue produits :
création, consultation, mise à jour, suppression, et recherche avancée avec filtres et pagination.
Il est consommé par **MS Commandes** via OpenFeign pour valider l'existence d'un produit avant
la création d'une commande.

---

## Stack

| Technologie | Usage |
|---|---|
| Java 17 + Spring Boot 3.4 | Framework principal |
| Spring Data JPA + MySQL 8 | Persistance |
| Spring Cloud Eureka Client | Service discovery |
| Spring Cloud Config Client | Configuration centralisée |
| Lombok | Réduction du boilerplate |
| Docker | Conteneurisation |

---

## Structure

- Product-MS/
  - Controllers/
    - ProductController.java — REST API produits (CRUD + recherche + métadonnées)
  - Entities/
    - Product.java — Entité produit (name, description, price, stockQuantity, imageUrl, category, brand)
  - Repositories/
    - ProductRepository.java — JPA + requêtes de recherche avancée
  - Services/
    - ProductService.java — Logique métier
  - resources/
    - application.properties

---

## Modèle Product

| Champ | Type | Description |
|---|---|---|
| id | Long | Identifiant auto-généré |
| name | String | Nom du produit |
| description | Text | Description détaillée |
| price | Double | Prix |
| stockQuantity | Integer | Quantité en stock |
| imageUrl | Text | URL de l'image |
| category | String | Catégorie |
| brand | String | Marque |
| createdAt | LocalDateTime | Date de création (auto) |

---

## API Endpoints

### CRUD

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/products` | Créer un produit |
| `GET` | `/products` | Lister tous les produits (paginé) |
| `GET` | `/products/{id}` | Détail d'un produit |
| `PUT` | `/products/{id}` | Modifier un produit |
| `DELETE` | `/products/{id}` | Supprimer un produit |

### Recherche avancée

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/products/search` | Recherche multi-critères (paginée) |
| `GET` | `/products/categories` | Lister toutes les catégories |
| `GET` | `/products/brands` | Lister toutes les marques |

### Paramètres de recherche `/products/search`

?name=mouse &category=gaming &brand=Razer &minPrice=50 &maxPrice=200 &inStock=true &page=0 &size=10 &sort=price,asc


### Paramètres de pagination `/products`

?page=0&size=10&sort=createdAt,desc


---

## Configuration

### Variables d'environnement (Docker)


SPRING_DATASOURCE_URL=jdbc:mysql://mysqldb:3306/MY2TEK_product_db
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root

SPRING_CONFIG_IMPORT=optional:configserver:http://config-server:8888


### Ports
Service	|Port
Product Microservice	|8086
MySQL	|3307 (host) → 3306 (container)

- Lancer en local
Avec Docker Compose (depuis la racine du projet)
- docker-compose up --build product-microservice
- Sans Docker (dev local)
S'assurer que MySQL tourne localement, puis :

cd Product-MS
./mvnw spring-boot:run

### Dépendances inter-services

Product Microservice
← MS Commandes — OpenFeign : vérification produit avant création de commande
→ Config Server — configuration centralisée
→ Eureka Server — service discovery
