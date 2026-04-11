import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../Service/user';
import { Router } from '@angular/router';
import { ShippingService } from '../../Ms-Shipping/Service/shipping';

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {
  userData: any = null;
  activeTab = 'info'; // 'info' | 'livraisons'

  // Edit modal
  isModalOpen: boolean = false;
  editData = { firstName: '', lastName: '', phone: '' };

  // Livraisons
  myShipments: any[] = [];
  shipmentsLoading = false;
  trackingInput = '';
  trackedShipment: any = null;
  trackError: string | null = null;

  // Return modal
  isReturnOpen = false;
  returnShipment: any = null;
  returnReason = '';
  returnError: string | null = null;
  returnSuccess: string | null = null;

  // Request shipment modal
  isRequestOpen = false;
  requestData = { orderId: '', destination: '', weightKg: '', widthCm: '', heightCm: '', lengthCm: '' };
  requestError: string | null = null;
  requestSuccess: string | null = null;

  constructor(
    private userService: User,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private shippingService: ShippingService
  ) {}

  ngOnInit() {
    this.userData = this.userService.getUserInfo();
    if (!this.userData) {
      this.router.navigate(['/login']);
    } else {
      this.editData.firstName = this.userData.firstName || '';
      this.editData.lastName = this.userData.lastName || '';
      this.editData.phone = this.userData.phone || '';
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'livraisons') this.loadMyShipments();
  }

  loadMyShipments() {
    this.shipmentsLoading = true;
    this.shippingService.getAllShipments().subscribe({
      next: (data) => {
        // Filter shipments by the logged-in user's email
        this.myShipments = data.filter((s: any) =>
          s.recipientEmail === this.userData?.sub
        );
        this.shipmentsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.shipmentsLoading = false; this.cdr.detectChanges(); }
    });
  }

  trackShipment() {
    if (!this.trackingInput.trim()) return;
    this.trackError = null;
    this.trackedShipment = null;
    this.shippingService.trackShipment(this.trackingInput.trim()).subscribe({
      next: (data) => { this.trackedShipment = data; this.cdr.detectChanges(); },
      error: () => { this.trackError = 'Aucun colis trouvé pour ce numéro.'; this.cdr.detectChanges(); }
    });
  }

  getStatusLabel(status: string): string {
    const map: any = {
      READY_TO_SHIP: 'Prêt', SHIPPED: 'Expédié', IN_TRANSIT: 'En transit',
      DELIVERED: 'Livré', RETURN_REQUESTED: 'Retour demandé',
      RETURN_SHIPPED: 'Retour expédié', RETURNED: 'Retourné'
    };
    return map[status] || status;
  }

  getStatusColor(status: string): string {
    const map: any = {
      READY_TO_SHIP: '#0369a1', SHIPPED: '#c2410c', IN_TRANSIT: '#854d0e',
      DELIVERED: '#15803d', RETURN_REQUESTED: '#dc2626',
      RETURN_SHIPPED: '#7e22ce', RETURNED: '#64748b'
    };
    return map[status] || '#94a3b8';
  }

  // ── Request shipment ─────────────────────────────────────────
  openRequest() { this.isRequestOpen = true; this.requestError = null; this.requestSuccess = null; }
  closeRequest() { this.isRequestOpen = false; }

  submitRequest() {
    this.requestError = null;
    const payload = {
      orderId: Number(this.requestData.orderId),
      weightKg: Number(this.requestData.weightKg) || 1,
      widthCm: Number(this.requestData.widthCm) || 20,
      heightCm: Number(this.requestData.heightCm) || 15,
      lengthCm: Number(this.requestData.lengthCm) || 30,
      destination: this.requestData.destination,
      recipientEmail: this.userData?.sub,
      recipientName: (this.userData?.firstName || '') + ' ' + (this.userData?.lastName || '')
    };
    this.shippingService.createShipment(payload).subscribe({
      next: () => {
        this.requestSuccess = 'Demande de livraison envoyée ! L\'admin va traiter votre commande.';
        this.cdr.detectChanges();
        setTimeout(() => { this.closeRequest(); this.loadMyShipments(); }, 2000);
      },
      error: (err) => {
        this.requestError = err.error?.error || 'Erreur lors de la demande.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Return ───────────────────────────────────────────────────
  openReturn(shipment: any) {
    this.returnShipment = shipment;
    this.returnReason = '';
    this.returnError = null;
    this.returnSuccess = null;
    this.isReturnOpen = true;
  }
  closeReturn() { this.isReturnOpen = false; }

  submitReturn() {
    if (!this.returnReason.trim()) { this.returnError = 'Veuillez indiquer la raison.'; return; }
    this.shippingService.requestReturn(this.returnShipment.id, this.returnReason, this.userData?.sub).subscribe({
      next: () => {
        this.returnSuccess = 'Retour demandé avec succès.';
        this.cdr.detectChanges();
        setTimeout(() => { this.closeReturn(); this.loadMyShipments(); }, 1500);
      },
      error: (err) => {
        this.returnError = err.error?.error || err.error || 'Erreur.';
        this.cdr.detectChanges();
      }
    });
  }

  onLogout() { this.userService.logout(); this.router.navigate(['/login']); }

  openModal() { this.isModalOpen = true; document.body.style.overflow = 'hidden'; }
  closeModal(event?: Event) {
    if (event && (event.target as HTMLElement).classList.contains('modal-content')) return;
    this.isModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  saveProfile() {
    if (!this.userData?.id) return;
    this.userService.updateUser(this.userData.id, this.editData).subscribe({
      next: (res: any) => {
        this.userService.saveToken(res.token);
        this.userData = this.userService.getUserInfo();
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: () => alert('Erreur lors de la mise à jour.')
    });
  }
}