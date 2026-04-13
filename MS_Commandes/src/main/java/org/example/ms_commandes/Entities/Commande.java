package org.example.ms_commandes.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

@Entity
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "client_id", nullable = false)
    private String clientId;

    @NotBlank
    @Column(name = "produit_id", nullable = false)
    private String produitId;

    @NotNull
    @Positive
    @Column(name = "prix_snapshot", nullable = false)
    private Double prixSnapshot;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer quantite;

    // Workflow : CREATED -> VALIDATED -> SHIPPED -> DELIVERED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCommande statut;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Constructeurs ──────────────────────────────────────────────────────────

    public Commande() {}

    public Commande(Long id, String clientId, String produitId, Double prixSnapshot,
                    Integer quantite, StatutCommande statut,
                    LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.clientId = clientId;
        this.produitId = produitId;
        this.prixSnapshot = prixSnapshot;
        this.quantite = quantite;
        this.statut = statut;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ── Lifecycle ──────────────────────────────────────────────────────────────

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

    // ── Getters & Setters ──────────────────────────────────────────────────────

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

    @Override
    public String toString() {
        return "Commande{id=" + id + ", clientId='" + clientId + "', produitId='" + produitId +
               "', statut=" + statut + ", quantite=" + quantite + ", prixSnapshot=" + prixSnapshot + "}";
    }
}
