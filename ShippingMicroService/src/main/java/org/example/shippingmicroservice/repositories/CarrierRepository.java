package org.example.shippingmicroservice.repositories;

import org.example.shippingmicroservice.entities.Carrier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarrierRepository extends JpaRepository<Carrier, Long> {
    Optional<Carrier> findByName(String name);
    // Find carriers that can handle the given weight
    java.util.List<Carrier> findByMaxWeightKgGreaterThanEqual(double weightKg);
}
