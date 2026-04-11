import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { PanierService } from '../../Ms-Commandes/service/panier.service';

@Component({
  selector: 'app-detail-product-page',
  standalone: false,
  templateUrl: './detail-product-page.html',
  styleUrl: './detail-product-page.css',
})
export class DetailProductPage implements OnInit {
  productId: string = '5';
  clientId: string = '';
  quantite: number = 1;
  addedToCart = false;

  newReview = { description: '', rating: 5, productId: this.productId, clientId: '' };
  reviews: any[] = [];
  isEnhancing = false;
  showForm = false;

  // Produit statique (à remplacer par un appel API si tu as un MS Produits)
  product = {
    id: 'MY2-RTX4090',
    nom: 'NVIDIA GeForce RTX 4090 Strix Edition',
    prix: 4999,
    prixAncien: 5499,
    image: 'https://files.pccasegear.com/images/1665464763-ROG-STRIX-RTX4090-O24G-GAMING-thb2.jpg',
    categorie: 'Cartes Graphiques',
    marque: 'ASUS ROG',
    description: 'La carte graphique ultime pour les gamers et créateurs. Architecture NVIDIA Ada Lovelace, 24 Go de mémoire G6X, et refroidissement Strix optimisé.'
  };

  constructor(
    private http: HttpClient,
    private panierService: PanierService,
    private router: Router
  ) {}

  ngOnInit() {
    this.extractUserId();
    this.loadReviews();
  }

  extractUserId() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.clientId = decoded.id || decoded.sub || 'Unknown';
        console.log("ID Client décodé :", this.clientId);
      } catch (error) {
        this.clientId = 'Invalid_Token';
      }
    } else {
      this.clientId = 'Guest';
    }
    this.newReview.clientId = this.clientId;
  }

  incrementQty() { this.quantite++; }
  decrementQty() { if (this.quantite > 1) this.quantite--; }

  ajouterAuPanier() {
    this.panierService.ajouter({
      produitId: this.product.id,
      nom: this.product.nom,
      prix: this.product.prix,
      image: this.product.image,
      categorie: this.product.categorie
    }, this.quantite);
    this.addedToCart = true;
    setTimeout(() => this.addedToCart = false, 2000);
  }

  allerAuPanier() {
    this.ajouterAuPanier();
    this.router.navigate(['/panier']);
  }

  get panierCount(): number {
    return this.panierService.count;
  }

  toggleReviewForm() { this.showForm = !this.showForm; }

  enhanceWithAI() {
    if (!this.newReview.description) return;
    this.isEnhancing = true;
    this.http.post('http://localhost:8084/Review/enhance', {
      text: this.newReview.description, rating: this.newReview.rating
    }).subscribe({
      next: (res: any) => { this.newReview.description = res.enhancedText; this.isEnhancing = false; },
      error: () => { this.isEnhancing = false; }
    });
  }

  submitReview() {
    if (!this.newReview.description) { alert("Veuillez écrire un commentaire."); return; }
    this.newReview.productId = this.productId;
    this.newReview.clientId = this.clientId;
    this.http.post('http://localhost:8084/Review/AjouterReview', this.newReview).subscribe({
      next: () => { this.loadReviews(); this.newReview.description = ''; this.showForm = false; },
      error: (err) => { console.error("Erreur:", err); }
    });
  }

  loadReviews() {
    this.http.get<any[]>('http://localhost:8084/Review/GetAllReview').subscribe({
      next: (data) => { this.reviews = data.filter(r => String(r.productId) === this.productId); },
      error: (err) => console.error(err)
    });
  }

  getStars(rating: number): number[] { return Array(rating).fill(0); }
}
