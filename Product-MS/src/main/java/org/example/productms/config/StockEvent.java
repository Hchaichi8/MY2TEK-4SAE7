package org.example.productms.config;

public class StockEvent {
    private String produitId;
    private int quantite;

    public StockEvent() {}
    public StockEvent(String produitId, int quantite) {
        this.produitId = produitId;
        this.quantite  = quantite;
    }

    public String getProduitId() { return produitId; }
    public void setProduitId(String produitId) { this.produitId = produitId; }
    public int getQuantite() { return quantite; }
    public void setQuantite(int quantite) { this.quantite = quantite; }
}
