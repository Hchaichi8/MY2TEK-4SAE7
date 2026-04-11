package org.example.ms_commandes.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Référence client (ID Keycloak ou user MS)
    @NotBlank
    @Column(name = "client_id", nullable = false)
    private String clientId;

    // Référence produit/article commandé
    @NotBlank
    @Column(name = "produit_id", nullable = false)
    private String produitId;

    // Snapshot du prix au moment de la commande (même si le catalogue change après)
    @NotNull
    @Positive
    @Column(name = "prix_snapshot", nullable = false)
    private Double prixSnapshot;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer quantite;

    // Workflow d'état : CREATED -> VALIDATED -> SHIPPED -> DELIVERED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCommande statut;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.statut == null) this.statut = StatutCommande.CREATED;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getProduitId() { return produitId; }
    public void setProduitId(String produitId) { this.produitId = produitId; }

    public Double getPrixSnapshot() { return prixSnapshot; }
    public void setPrixSnapshot(Double prixSnapshot) { this.prixSnapshot = prixSnapshot; }

    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }

    public StatutCommande getStatut() { return statut; }
    public void setStatut(StatutCommande statut) { this.statut = statut; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
