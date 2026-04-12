package org.example.shippingmicroservice.controllers;

import jakarta.validation.Valid;
import org.example.shippingmicroservice.entities.Carrier;
import org.example.shippingmicroservice.services.CarrierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/carriers")
@CrossOrigin(origins = "http://localhost:4200")

public class CarrierController {

    @Autowired
    private CarrierService carrierService;

    // GET /carriers
    @GetMapping
    public ResponseEntity<List<Carrier>> getAllCarriers() {
        return ResponseEntity.ok(carrierService.getAllCarriers());
    }

    // GET /carriers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getCarrierById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(carrierService.getCarrierById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /carriers
    @PostMapping
    public ResponseEntity<?> createCarrier(@Valid @RequestBody Carrier carrier) {
        try {
            return new ResponseEntity<>(carrierService.createCarrier(carrier), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /carriers/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCarrier(@PathVariable Long id, @Valid @RequestBody Carrier carrier) {
        try {
            return ResponseEntity.ok(carrierService.updateCarrier(id, carrier));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /carriers/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCarrier(@PathVariable Long id) {
        try {
            carrierService.deleteCarrier(id);
            return ResponseEntity.ok("Transporteur supprimé.");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
