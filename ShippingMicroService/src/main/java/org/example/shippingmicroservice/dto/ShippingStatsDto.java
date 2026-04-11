package org.example.shippingmicroservice.dto;

import java.util.Map;

public class ShippingStatsDto {

    private long totalShipments;
    private long deliveredCount;
    private long inTransitCount;
    private long readyToShipCount;
    private long returnCount;
    private double deliverySuccessRate;   // % of shipments that reached DELIVERED
    private double returnRate;            // % of shipments that were returned
    private double averageShippingCost;
    private Map<String, Long> shipmentsByCarrier;  // carrier name → count
    private Map<String, Long> shipmentsByStatus;   // status → count

    public ShippingStatsDto() {}

    public long getTotalShipments() { return totalShipments; }
    public void setTotalShipments(long totalShipments) { this.totalShipments = totalShipments; }

    public long getDeliveredCount() { return deliveredCount; }
    public void setDeliveredCount(long deliveredCount) { this.deliveredCount = deliveredCount; }

    public long getInTransitCount() { return inTransitCount; }
    public void setInTransitCount(long inTransitCount) { this.inTransitCount = inTransitCount; }

    public long getReadyToShipCount() { return readyToShipCount; }
    public void setReadyToShipCount(long readyToShipCount) { this.readyToShipCount = readyToShipCount; }

    public long getReturnCount() { return returnCount; }
    public void setReturnCount(long returnCount) { this.returnCount = returnCount; }

    public double getDeliverySuccessRate() { return deliverySuccessRate; }
    public void setDeliverySuccessRate(double deliverySuccessRate) { this.deliverySuccessRate = deliverySuccessRate; }

    public double getReturnRate() { return returnRate; }
    public void setReturnRate(double returnRate) { this.returnRate = returnRate; }

    public double getAverageShippingCost() { return averageShippingCost; }
    public void setAverageShippingCost(double averageShippingCost) { this.averageShippingCost = averageShippingCost; }

    public Map<String, Long> getShipmentsByCarrier() { return shipmentsByCarrier; }
    public void setShipmentsByCarrier(Map<String, Long> shipmentsByCarrier) { this.shipmentsByCarrier = shipmentsByCarrier; }

    public Map<String, Long> getShipmentsByStatus() { return shipmentsByStatus; }
    public void setShipmentsByStatus(Map<String, Long> shipmentsByStatus) { this.shipmentsByStatus = shipmentsByStatus; }
}
