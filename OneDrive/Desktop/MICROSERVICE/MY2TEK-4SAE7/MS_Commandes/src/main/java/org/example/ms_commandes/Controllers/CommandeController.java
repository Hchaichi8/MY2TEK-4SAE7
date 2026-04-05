package org.example.ms_commandes.Controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.ms_commandes.Entities.Commande;
import org.example.ms_commandes.Entities.StatutCommande;
import org.example.ms_commandes.Services.Interface.CommandeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Commandes")
@Tag(name = "Commandes", description = "API de gestion des commandes MY2TEK")
public class CommandeController {

    private final CommandeService commandeService;

    public CommandeController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    @Operation(summary = "Créer une commande — vérifie l'utilisateur via Feign (UserMicroService)")
    @PostMapping("/creer")
    public ResponseEntity<?> creerCommande(@RequestBody Commande commande) {
        try {
            return new ResponseEntity<>(commandeService.creerCommande(commande), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Lister toutes les commandes")
    @GetMapping("/all")
    public List<Commande> getAllCommandes() {
        return commandeService.getAllCommandes();
    }

    @Operation(summary = "Obtenir une commande par ID")
    @GetMapping("/{id}")
    public ResponseEntity<Commande> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(commandeService.getCommandeById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Commandes d'un client par path variable")
    @GetMapping("/client/{clientId}")
    public List<Commande> getByClient(@PathVariable String clientId) {
        return commandeService.getCommandesByClient(clientId);
    }

    @Operation(summary = "Commandes d'un client par query param")
    @GetMapping("/client")
    public List<Commande> getByClientParam(@RequestParam String clientId) {
        return commandeService.getCommandesByClient(clientId);
    }

    @Operation(summary = "Commandes par statut")
    @GetMapping("/statut/{statut}")
    public List<Commande> getByStatut(@PathVariable StatutCommande statut) {
        return commandeService.getCommandesByStatut(statut);
    }

    @Operation(summary = "Modifier une commande (seulement si statut CREATED)")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCommande(@PathVariable Long id, @RequestBody Commande updated) {
        try {
            Commande existing = commandeService.getCommandeById(id);
            if (existing.getStatut() != StatutCommande.CREATED) {
                return ResponseEntity.badRequest().body("Modification impossible : commande déjà traitée.");
            }
            existing.setProduitId(updated.getProduitId());
            existing.setQuantite(updated.getQuantite());
            existing.setPrixSnapshot(updated.getPrixSnapshot());
            return ResponseEntity.ok(commandeService.updateCommande(existing));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Changer le statut — publie dans RabbitMQ si DELIVERED")
    @PutMapping("/{id}/statut/{statut}")
    public ResponseEntity<?> updateStatut(@PathVariable Long id, @PathVariable StatutCommande statut) {
        try {
            return ResponseEntity.ok(commandeService.updateStatut(id, statut));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Annuler une commande")
    @DeleteMapping("/annuler/{id}")
    public ResponseEntity<?> annulerCommande(@PathVariable Long id) {
        try {
            commandeService.annulerCommande(id);
            return ResponseEntity.ok("Commande annulée avec succès.");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
