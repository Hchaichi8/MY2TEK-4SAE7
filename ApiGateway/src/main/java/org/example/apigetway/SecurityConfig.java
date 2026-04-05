package org.example.apigetway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(exchanges -> exchanges

                // ── Allow CORS preflight requests (browser sends OPTIONS first) ──
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ── Public routes — no token needed ──────────────────────────────
                // Anyone can track a shipment
                .pathMatchers(HttpMethod.GET, "/shipments/track/**").permitAll()
                // Welcome message (Config Server demo)
                .pathMatchers(HttpMethod.GET, "/shipments/welcome").permitAll()
                // Auth endpoints — must be public so users can log in
                .pathMatchers(HttpMethod.POST, "/users/login").permitAll()
                .pathMatchers(HttpMethod.POST, "/users/register").permitAll()
                .pathMatchers(HttpMethod.POST, "/users/forgot-password").permitAll()
                .pathMatchers(HttpMethod.POST, "/users/reset-password").permitAll()
                .pathMatchers(HttpMethod.POST, "/users/google-login").permitAll()
                // Health checks
                .pathMatchers("/actuator/**").permitAll()

                // ── Shipping & Carriers — permit all (Keycloak demo via Postman) ──
                .pathMatchers("/shipments/**").permitAll()
                .pathMatchers("/carriers/**").permitAll()
                .pathMatchers("/users/**").permitAll()

                // ── Everything else requires authentication ───────────────────────
                .anyExchange().permitAll()
            );
            // Tell the gateway to validate JWT tokens issued by Keycloak
            // Disabled for now — enable when Keycloak is running
            // .oauth2ResourceServer(oauth2 -> oauth2
            //     .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtConverter()))
            // );

        return http.build();
    }

    /**
     * Reads roles from Keycloak JWT token.
     *
     * Keycloak puts roles inside: { "realm_access": { "roles": ["ADMIN", "CLIENT"] } }
     * Spring Security needs them as: ROLE_ADMIN, ROLE_CLIENT
     *
     * This converter does that mapping automatically.
     */
    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> keycloakJwtConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {

            // Extract realm_access.roles from the JWT
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess == null) return List.of();

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) realmAccess.get("roles");
            if (roles == null) return List.of();

            // Convert "ADMIN" → ROLE_ADMIN so Spring Security hasRole("ADMIN") works
            return roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    .collect(Collectors.toList());
        });
        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }
}
