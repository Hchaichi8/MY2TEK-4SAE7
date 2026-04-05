package org.example.apigetway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class ApigetwayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApigetwayApplication.class, args);
    }

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                // ── UserMicroService ──────────────────────────────────────
                .route("route_users", r -> r.path("/users/**")
                        .uri("lb://USERMICROSERVICE"))

                // ── Config Server ─────────────────────────────────────────
                .route("route_config", r -> r.path("/config/**")
                        .uri("lb://CONFIG-SERVER"))

                // ── ShippingMicroService ──────────────────────────────────
                .route("route_shipments", r -> r.path("/shipments/**")
                        .uri("lb://SHIPPINGMICROSERVICE"))
                .route("route_carriers", r -> r.path("/carriers/**")
                        .uri("lb://SHIPPINGMICROSERVICE"))

                // ── Other team microservices ──────────────────────────────
                .route("route_project", r -> r.path("/Project/**")
                        .uri("lb://PROJECTMICROSERVICE"))
                .route("route_contract", r -> r.path("/Contract/**")
                        .uri("lb://PROJECTMICROSERVICE"))
                .route("route_competance", r -> r.path("/Competance/**")
                        .uri("lb://MSCOMPETENCEANDREVIEW"))
                .route("route_review", r -> r.path("/Review/**")
                        .uri("lb://MSCOMPETENCEANDREVIEW"))
                .build();
    }
}
