package org.example.shippingmicroservice.config;

import org.example.shippingmicroservice.entities.Carrier;
import org.example.shippingmicroservice.repositories.CarrierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds default carriers on first startup if none exist.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CarrierRepository carrierRepository;

    @Override
    public void run(String... args) {
        if (carrierRepository.count() == 0) {
            Carrier aramex = new Carrier();
            aramex.setName("Aramex");
            aramex.setBasePrice(5.0);
            aramex.setPricePerKg(2.5);
            aramex.setMaxWeightKg(30.0);
            carrierRepository.save(aramex);

            Carrier dhl = new Carrier();
            dhl.setName("DHL");
            dhl.setBasePrice(8.0);
            dhl.setPricePerKg(3.0);
            dhl.setMaxWeightKg(70.0);
            carrierRepository.save(dhl);

            Carrier rapidPoste = new Carrier();
            rapidPoste.setName("Rapid Poste");
            rapidPoste.setBasePrice(3.0);
            rapidPoste.setPricePerKg(1.5);
            rapidPoste.setMaxWeightKg(20.0);
            carrierRepository.save(rapidPoste);

            System.out.println("[DataSeeder] 3 transporteurs par défaut créés.");
        }
    }
}
