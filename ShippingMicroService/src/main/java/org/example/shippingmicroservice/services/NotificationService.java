package org.example.shippingmicroservice.services;

import org.example.shippingmicroservice.entities.Shipment;
import org.example.shippingmicroservice.entities.ShipmentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendStatusUpdateEmail(Shipment shipment, ShipmentStatus oldStatus) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ghassenben9@gmail.com");
            message.setTo(shipment.getRecipientEmail());
            message.setSubject(buildSubject(shipment.getStatus()));
            message.setText(buildBody(shipment, oldStatus));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[NotificationService] Failed to send email: " + e.getMessage());
        }
    }

    public void sendShipmentCreatedEmail(Shipment shipment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ghassenben9@gmail.com");
            message.setTo(shipment.getRecipientEmail());
            message.setSubject("MY2TEK - Votre colis est prêt à être expédié");
            message.setText(
                "Bonjour " + shipment.getRecipientName() + ",\n\n" +
                "Votre commande #" + shipment.getOrderId() + " a été prise en charge.\n\n" +
                "Numéro de suivi : " + shipment.getTrackingNumber() + "\n" +
                "Transporteur    : " + shipment.getCarrier().getName() + "\n" +
                "Destination     : " + shipment.getDestination() + "\n" +
                "Frais de livraison : " + String.format("%.2f", shipment.getShippingCost()) + " TND\n\n" +
                "Vous pouvez suivre votre colis sur : http://localhost:4200/track/" + shipment.getTrackingNumber() + "\n\n" +
                "Merci pour votre confiance,\nL'équipe MY2TEK"
            );
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[NotificationService] Failed to send creation email: " + e.getMessage());
        }
    }

    private String buildSubject(ShipmentStatus status) {
        return switch (status) {
            case SHIPPED      -> "MY2TEK - Votre colis a été expédié";
            case IN_TRANSIT   -> "MY2TEK - Votre colis est en transit";
            case DELIVERED    -> "MY2TEK - Votre colis a été livré";
            default           -> "MY2TEK - Mise à jour de votre livraison";
        };
    }

    private String buildBody(Shipment shipment, ShipmentStatus oldStatus) {
        String statusLabel = switch (shipment.getStatus()) {
            case SHIPPED    -> "expédié par " + shipment.getCarrier().getName();
            case IN_TRANSIT -> "en cours de transit";
            case DELIVERED  -> "livré à destination";
            default         -> "mis à jour";
        };

        return "Bonjour " + shipment.getRecipientName() + ",\n\n" +
               "Le statut de votre colis a changé :\n" +
               "  " + oldStatus + "  →  " + shipment.getStatus() + "\n\n" +
               "Numéro de suivi : " + shipment.getTrackingNumber() + "\n" +
               "Votre colis est maintenant " + statusLabel + ".\n\n" +
               "Suivre votre colis : http://localhost:4200/track/" + shipment.getTrackingNumber() + "\n\n" +
               "Merci,\nL'équipe MY2TEK";
    }
}
