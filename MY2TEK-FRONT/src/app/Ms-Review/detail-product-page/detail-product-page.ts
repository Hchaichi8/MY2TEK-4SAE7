import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode'; // Utilisation de ton import

@Component({
  selector: 'app-detail-product-page',
  standalone: false,
  templateUrl: './detail-product-page.html',
  styleUrl: './detail-product-page.css',
})
export class DetailProductPage implements OnInit {
  
  // Paramètres du produit
  productId: string = '5';
  clientId: string = '';
  
  // Objet pour la nouvelle review
  newReview = { 
    description: '', 
    rating: 5, 
    productId: this.productId, 
    clientId: '' 
  };
  
  reviews: any[] = [];
  isEnhancing = false;
  showForm = false;

  constructor(private http: HttpClient) {} 

  ngOnInit() {
    this.extractUserId();
    this.loadReviews();
  }

  // --- LOGIQUE DE DÉCODAGE JWT ---
  extractUserId() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Décodage du token avec la librairie installée
        const decoded: any = jwtDecode(token);
        
        // On récupère l'ID (on teste 'id', puis 'sub' qui est le standard JWT pour l'ID)
        this.clientId = decoded.id || decoded.sub || 'Unknown';
        
        console.log("ID Client décodé :", this.clientId);
      } catch (error) {
        console.error("Erreur de décodage du token", error);
        this.clientId = 'Invalid_Token';
      }
    } else {
      this.clientId = 'Guest';
    }
    // On met à jour l'objet pour l'envoi futur
    this.newReview.clientId = this.clientId;
  }

  toggleReviewForm() {
    this.showForm = !this.showForm;
  }

  // --- APPEL API IA ---
  enhanceWithAI() {
    if (!this.newReview.description) return;
    this.isEnhancing = true;
    
    this.http.post('http://localhost:8084/Review/enhance', {
      text: this.newReview.description,
      rating: this.newReview.rating
    }).subscribe({
      next: (res: any) => {
        this.newReview.description = res.enhancedText;
        this.isEnhancing = false;
      },
      error: (err) => {
        console.error("Erreur IA:", err);
        this.isEnhancing = false;
      }
    });
  }

  // --- PUBLICATION DE LA REVIEW ---
  submitReview() {
    if (!this.newReview.description) {
      alert("Veuillez écrire un commentaire.");
      return;
    }

    // Sécurité de dernière minute sur les IDs
    this.newReview.productId = this.productId;
    this.newReview.clientId = this.clientId;

    this.http.post('http://localhost:8084/Review/AjouterReview', this.newReview).subscribe({
      next: (res) => {
        console.log("Review publiée avec succès !");
        this.loadReviews(); // Rafraîchir la liste
        this.newReview.description = ''; // Vider le champ
        this.showForm = false; // Fermer le formulaire
      },
      error: (err) => {
        console.error("Erreur lors de la publication:", err);
        alert("Erreur de publication. Vérifie la console.");
      }
    });
  }

  // --- CHARGEMENT DES REVIEWS ---
  loadReviews() {
    this.http.get<any[]>('http://localhost:8084/Review/GetAllReview').subscribe({
      next: (data) => {
        // Filtrage strict par l'ID du produit actuel ('5')
        this.reviews = data.filter(r => String(r.productId) === this.productId);
      },
      error: (err) => console.error("Erreur de chargement des avis:", err)
    });
  }

  // Helper pour l'affichage des étoiles dans le HTML
  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}