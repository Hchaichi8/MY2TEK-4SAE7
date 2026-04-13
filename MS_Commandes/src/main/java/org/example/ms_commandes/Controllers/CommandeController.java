package org.example.ms_commandes.Controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.ms_commandes.Entities.Commande;
import org.example.ms_commandes.Entities.StatutCommande;
import org.example.ms_commandes.Services.Interface.CommandeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Commandes")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Commandes", description = "Gestion des commandes — CRUD complet + workflow de statuts")
@SecurityRequirement(name = "bearerAuth")
public class CommandeController {

    private static final Logger log = LoggerFactory.getLogger(CommandeController.class);
    private final CommandeService commandeService;

    public CommandeController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Operation(summary = "Créer une commande",
               description = "Vérifie le client (Feign/UserMS) et le produit (Feign/ProductMS) avant de créer")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Commande créée"),
        @ApiResponse(responseCode = "400", description = "Données invalides ou client/produit introuvable")
    })
    @PostMapping("/creer")
    public ResponseEntity<Commande> creerCommande(@Valid @RequestBody Commande commande) {
        log.info("[POST] /Commandes/creer — client={}", commande.getClientId());
        return new ResponseEntity<>(commandeService.creerCommande(commande), HttpStatus.CREATED);
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    @Operation(summary = "Lister toutes les commandes")
    @GetMapping("/all")
    public List<Commande> getAllCommandes() {
        log.info("[GET] /Commandes/all");
        return commandeService.getAllCommandes();
    }

    @Operation(summary = "Obtenir une commande par ID")
    @ApiResponse(responseCode = "404", description = "Commande introuvable")
    @GetMapping("/{id}")
    public ResponseEntity<Commande> getById(@PathVariable Long id) {
        return ResponseEntity.ok(commandeService.getCommandeById(id));
    }

    @Operation(summary = "Commandes d'un client (path variable)")
    @GetMapping("/client/{clientId}")
    public List<Commande> getByClient(@PathVariable String clientId) {
        return commandeService.getCommandesByClient(clientId);
    }

    @Operation(summary = "Commandes d'un client (query param)")
    @GetMapping("/client")
    public List<Commande> getByClientParam(@RequestParam String clientId) {
        return commandeService.getCommandesByClient(clientId);
    }

    @Operation(summary = "Commandes par statut")
    @GetMapping("/statut/{statut}")
    public List<Commande> getByStatut(
            @Parameter(description = "CREATED | VALIDATED | SHIPPED | DELIVERED | CANCELLED")
            @PathVariable StatutCommande statut) {
        return commandeService.getCommandesByStatut(statut);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @Operation(summary = "Modifier une commande",
               description = "Modification autorisée uniquement si statut = CREATED. Règle métier gérée dans le Service.")
    @PutMapping("/{id}")
    public ResponseEntity<Commande> updateCommande(
            @PathVariable Long id,
            @Valid @RequestBody Commande updated) {
        log.info("[PUT] /Commandes/{}", id);
        // Toute la logique métier est dans CommandeServiceImpl.updateCommande()
        return ResponseEntity.ok(commandeService.updateCommande(id, updated));
    }

    @Operation(summary = "Changer le statut d'une commande",
               description = "DELIVERED → publie RabbitMQ vers MS_CompetenceAndReview")
    @PutMapping("/{id}/statut/{statut}")
    public ResponseEntity<Commande> updateStatut(
            @PathVariable Long id,
            @Parameter(description = "Nouveau statut") @PathVariable StatutCommande statut) {
        log.info("[PUT] /Commandes/{}/statut/{}", id, statut);
        return ResponseEntity.ok(commandeService.updateStatut(id, statut));
    }

    @Operation(summary = "Annuler une commande (soft delete)",
               description = "Passe le statut à CANCELLED et publie un événement RabbitMQ")
    @PutMapping("/annuler/{id}")
    public ResponseEntity<String> annulerCommande(@PathVariable Long id) {
        log.info("[PUT] /Commandes/annuler/{}", id);
        commandeService.annulerCommande(id);
        return ResponseEntity.ok("Commande annulée avec succès.");
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Operation(summary = "Supprimer définitivement une commande (admin)",
               description = "Suppression physique en base de données — réservé aux administrateurs")
    @ApiResponse(responseCode = "204", description = "Commande supprimée")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerCommande(@PathVariable Long id) {
        log.info("[DELETE] /Commandes/{}", id);
        commandeService.supprimerCommande(id);
        return ResponseEntity.noContent().build();
    }
}
