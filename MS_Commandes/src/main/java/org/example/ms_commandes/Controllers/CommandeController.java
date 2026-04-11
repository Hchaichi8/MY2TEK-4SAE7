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
@CrossOrigin(origins = "http://localhost:4200")

public class CommandeController {

    private final CommandeService commandeService;

    public CommandeController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    @PostMapping("/creer")
    public ResponseEntity<?> creerCommande(@RequestBody Commande commande) {
        try {
            return new ResponseEntity<>(commandeService.creerCommande(commande), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public List<Commande> getAllCommandes() {
        return commandeService.getAllCommandes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Commande> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(commandeService.getCommandeById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/client/{clientId}")
    public List<Commande> getByClient(@PathVariable String clientId) {
        return commandeService.getCommandesByClient(clientId);
    }

    @GetMapping("/client")
    public List<Commande> getByClientParam(@RequestParam String clientId) {
        return commandeService.getCommandesByClient(clientId);
    }

    @GetMapping("/statut/{statut}")
    public List<Commande> getByStatut(@PathVariable StatutCommande statut) {
        return commandeService.getCommandesByStatut(statut);
    }

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

    @PutMapping("/{id}/statut/{statut}")
    public ResponseEntity<?> updateStatut(@PathVariable Long id, @PathVariable StatutCommande statut) {
        try {
            return ResponseEntity.ok(commandeService.updateStatut(id, statut));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

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
