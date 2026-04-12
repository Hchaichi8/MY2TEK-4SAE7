package org.example.shippingmicroservice.dto;

import jakarta.validation.constraints.NotNull;
import org.example.shippingmicroservice.entities.ShipmentStatus;

public class UpdateStatusRequest {

    @NotNull
    private ShipmentStatus status;

    private String changedBy = "admin";

    private String note;

    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
