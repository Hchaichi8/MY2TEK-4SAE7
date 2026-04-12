import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ShippingService } from '../../Ms-Shipping/Service/shipping';

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {
  userData: KeycloakProfile | null = null;
  userRoles: string[] = [];
  localProfile: any = null;
  myReviews: any[] = [];
  activeTab: string = 'profile';

  // ✅ Edit review modal
  isReviewModalOpen = false;
  editingReview: any = null;
  editReviewData = { description: '', rating: 5 };

  isModalOpen = false;
  editData = { firstName: '', lastName: '', phone: '', zipCode: '', location: '' };

   myShipments: any[] = [];
  shipmentsLoading = false;
  shipmentsError: string | null = null;

  isShipmentModalOpen = false;
  carriers: any[] = [];
  newShipment = { destination: '', weightKg: '', widthCm: '', heightCm: '', lengthCm: '', carrierId: '' };
  shipmentCreateError: string | null = null;
  shipmentCreateSuccess: string | null = null;

  isTrackOpen = false;
  trackingInput = '';
  trackResult: any = null;
  trackError: string | null = null;

  isEditShipOpen = false;
  editShip: any = null;
  editShipError: string | null = null;
  editShipSuccess: string | null = null;

  trackSteps = ['READY_TO_SHIP', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'];

  private readonly GATEWAY = 'http://localhost:8085';

  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private shippingService: ShippingService
  ) {}

  async ngOnInit() {
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    if (!isLoggedIn) { this.keycloakService.login(); return; }

    this.userData = await this.keycloakService.loadUserProfile();
    this.userRoles = this.keycloakService.getUserRoles();
    this.editData.firstName = this.userData.firstName || '';
    this.editData.lastName  = this.userData.lastName  || '';

    const token = this.getToken();

    this.http.get(`${this.GATEWAY}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (profile: any) => {
        this.localProfile      = profile;
        this.editData.phone    = profile.phone    || '';
        this.editData.zipCode  = profile.zipCode  || '';
        this.editData.location = profile.location || '';
        this.cdr.detectChanges();
      },
      error: (e) => console.warn('Could not load local profile:', e)
    });

    this.loadMyReviews(token);
    this.cdr.detectChanges();
  }

  private getToken(): string {
    const session = sessionStorage.getItem('kc_token');
    if (session) return session;
    return this.keycloakService.getKeycloakInstance().token ?? '';
  }

  loadMyReviews(token: string) {
    this.http.get<any>(`${this.GATEWAY}/users/me/reviews`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        this.myReviews = res.reviews || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('Could not load reviews:', err)
    });
  }

  // ✅ Open edit review modal
  openEditReview(review: any) {
    this.editingReview = review;
    this.editReviewData = {
      description: review.description,
      rating: review.rating
    };
    this.isReviewModalOpen = true;
  }

  closeReviewModal() {
    this.isReviewModalOpen = false;
    this.editingReview = null;
  }

  // ✅ Save updated review
  saveReview() {
    if (!this.editingReview) return;
    const token = this.getToken();

    const payload = {
      id:          this.editingReview.id,
      description: this.editReviewData.description,
      rating:      this.editReviewData.rating,
      clientId:    this.editingReview.clientId,
      clientName:  this.editingReview.clientName,
      productId:   this.editingReview.productId,
      createdAt:   this.editingReview.createdAt
    };

    this.http.put(
      `${this.GATEWAY}/Review/UpdateMyReview/${this.editingReview.id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        console.log('✅ Review updated');
        this.isReviewModalOpen = false;
        this.editingReview = null;
        this.loadMyReviews(token); // refresh list
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Update review failed:', err)
    });
  }

  // ✅ Delete review
  deleteReview(reviewId: number) {
    if (!confirm('Voulez-vous vraiment supprimer cet avis ?')) return;
    const token = this.getToken();

    this.http.delete(
      `${this.GATEWAY}/Review/DeleteMyReview/${reviewId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        console.log('✅ Review deleted');
        this.myReviews = this.myReviews.filter(r => r.id !== reviewId);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Delete review failed:', err)
    });
  }

  // ✅ Set star rating in edit modal
  setEditRating(star: number) {
    this.editReviewData.rating = star;
  }

  setTab(tab: string) { this.activeTab = tab; }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  onLogout() {
    sessionStorage.clear();
    localStorage.clear();
    this.keycloakService.logout(window.location.origin + '/login');
  }

  openModal()  { this.isModalOpen = true; }
  closeModal(event?: Event) {
    if (event && (event.target as HTMLElement).classList.contains('modal-content')) return;
    this.isModalOpen = false;
  }

  async saveProfile() {
    const token = this.getToken();

    this.http.post(
      `http://localhost:8100/realms/MY2TEK-realm/account`,
      {
        id:        this.userData?.id,
        username:  this.userData?.username,
        email:     this.userData?.email,
        firstName: this.editData.firstName,
        lastName:  this.editData.lastName,
      },
      { headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })}
    ).subscribe();

    this.http.put(`${this.GATEWAY}/users/me`, this.editData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: async () => {
        this.userData    = await this.keycloakService.loadUserProfile();
        this.isModalOpen = false;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Update failed:', e)
    });
  }
    loadMyShipments() {
    this.shipmentsLoading = true;
    this.shipmentsError = null;
    this.shippingService.getAllShipments().subscribe({
      next: (data) => {
        const userEmail = (this.userData?.email || '').toLowerCase();
        this.myShipments = data.filter((s: any) =>
          s.recipientEmail?.toLowerCase() === userEmail
        );
        this.shipmentsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.shipmentsError = 'Impossible de charger vos livraisons.';
        this.shipmentsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  openShipmentModal() {
    this.isShipmentModalOpen = true;
    this.shipmentCreateError = null;
    this.shipmentCreateSuccess = null;
    this.newShipment = { destination: '', weightKg: '', widthCm: '', heightCm: '', lengthCm: '', carrierId: '' };
    this.shippingService.getAllCarriers().subscribe(data => { this.carriers = data; this.cdr.detectChanges(); });
  }
  openTrack(trackingNumber?: string) {
    this.isTrackOpen = true;
    this.trackResult = null;
    this.trackError = null;
    this.trackingInput = trackingNumber || '';
    if (trackingNumber) this.doTrack();
  }
  doTrack() {
    if (!this.trackingInput.trim()) return;
    this.trackResult = null;
    this.trackError = null;
    this.shippingService.trackShipment(this.trackingInput.trim()).subscribe({
      next: (data) => { this.trackResult = data; this.cdr.detectChanges(); },
      error: () => { this.trackError = 'Aucun colis trouvé.'; this.cdr.detectChanges(); }
    });
  }
  openEditShip(shipment: any) {
    if (shipment.status !== 'READY_TO_SHIP') {
      alert('Modification possible uniquement pour les livraisons "Prêt à expédier".');
      return;
    }
    this.editShip = { ...shipment };
    this.editShipError = null;
    this.editShipSuccess = null;
    this.isEditShipOpen = true;
  }

  closeEditShip() { this.isEditShipOpen = false; }

  submitEditShip() {
    this.editShipError = null;
    const payload = {
      orderId: this.editShip.orderId, recipientName: this.editShip.recipientName,
      recipientEmail: this.editShip.recipientEmail, destination: this.editShip.destination,
      weightKg: Number(this.editShip.weightKg), widthCm: Number(this.editShip.widthCm),
      heightCm: Number(this.editShip.heightCm), lengthCm: Number(this.editShip.lengthCm),
    };
    this.shippingService.updateShipment(this.editShip.id, payload).subscribe({
      next: () => {
        this.editShipSuccess = 'Livraison mise à jour !';
        this.cdr.detectChanges();
        setTimeout(() => { this.closeEditShip(); this.loadMyShipments(); }, 1200);
      },
      error: (err) => { this.editShipError = err.error?.error || 'Erreur.'; this.cdr.detectChanges(); }
    });
  }

  cancelShipment(shipment: any) {
    if (shipment.status !== 'READY_TO_SHIP') { alert('Annulation possible uniquement pour les livraisons "Prêt à expédier".'); return; }
    if (!confirm(`Annuler la livraison ${shipment.trackingNumber} ?`)) return;
    this.shippingService.deleteShipment(shipment.id).subscribe({
      next: () => { this.myShipments = this.myShipments.filter(s => s.id !== shipment.id); this.cdr.detectChanges(); },
      error: () => alert('Erreur lors de l\'annulation.')
    });
  }

  getStepIndex(status: string): number { return this.trackSteps.indexOf(status); }

  getStepLabel(step: string): string {
    const map: any = { READY_TO_SHIP: 'Prêt', SHIPPED: 'Expédié', IN_TRANSIT: 'En transit', DELIVERED: 'Livré' };
    return map[step] || step;
  }

  getStepIcon(step: string): string {
    const map: any = { READY_TO_SHIP: 'fa-box', SHIPPED: 'fa-shipping-fast', IN_TRANSIT: 'fa-truck', DELIVERED: 'fa-check-circle' };
    return map[step] || 'fa-circle';
  }

  getStatusLabel(status: string): string {
    const map: any = { READY_TO_SHIP: 'Prêt', SHIPPED: 'Expédié', IN_TRANSIT: 'En transit',
      DELIVERED: 'Livré', RETURN_REQUESTED: 'Retour demandé', RETURN_SHIPPED: 'Retour expédié', RETURNED: 'Retourné' };
    return map[status] || status;
  }

  getStatusColor(status: string): string {
    const map: any = { READY_TO_SHIP: '#0369a1', SHIPPED: '#c2410c', IN_TRANSIT: '#854d0e',
      DELIVERED: '#15803d', RETURN_REQUESTED: '#dc2626', RETURN_SHIPPED: '#7e22ce', RETURNED: '#64748b' };
    return map[status] || '#94a3b8';
  }




}