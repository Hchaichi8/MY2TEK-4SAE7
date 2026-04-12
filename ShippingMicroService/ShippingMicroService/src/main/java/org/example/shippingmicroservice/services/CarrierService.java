package org.example.shippingmicroservice.services;

import org.example.shippingmicroservice.entities.Carrier;
import org.example.shippingmicroservice.repositories.CarrierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarrierService {

    @Autowired
    private CarrierRepository carrierRepository;

    public List<Carrier> getAllCarriers() {
        return carrierRepository.findAll();
    }

    public Carrier getCarrierById(Long id) {
        return carrierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transporteur introuvable avec l'id: " + id));
    }

    public Carrier createCarrier(Carrier carrier) {
        if (carrierRepository.findByName(carrier.getName()).isPresent()) {
            throw new RuntimeException("Un transporteur avec ce nom existe déjà.");
        }
        return carrierRepository.save(carrier);
    }

    public Carrier updateCarrier(Long id, Carrier details) {
        Carrier existing = getCarrierById(id);
        existing.setName(details.getName());
        existing.setBasePrice(details.getBasePrice());
        existing.setPricePerKg(details.getPricePerKg());
        existing.setMaxWeightKg(details.getMaxWeightKg());
        return carrierRepository.save(existing);
    }

    public void deleteCarrier(Long id) {
        if (!carrierRepository.existsById(id)) {
            throw new RuntimeException("Transporteur introuvable.");
        }
        carrierRepository.deleteById(id);
    }

    /**
     * Auto-select the cheapest carrier that can handle the given weight.
     */
    public Carrier selectBestCarrier(double weightKg) {
        List<Carrier> eligible = carrierRepository.findByMaxWeightKgGreaterThanEqual(weightKg);
        if (eligible.isEmpty()) {
            throw new RuntimeException("Aucun transporteur disponible pour ce poids: " + weightKg + " kg");
        }
        // Pick the one with the lowest total cost for this weight
        return eligible.stream()
                .min((a, b) -> {
                    double costA = a.getBasePrice() + (a.getPricePerKg() * weightKg);
                    double costB = b.getBasePrice() + (b.getPricePerKg() * weightKg);
                    return Double.compare(costA, costB);
                })
                .orElseThrow();
    }
}
