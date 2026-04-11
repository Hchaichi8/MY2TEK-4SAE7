import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShippingService } from '../../Service/shipping';

@Component({
  selector: 'app-shipping-admin',
  standalone: false,
  templateUrl: './shipping-admin.html',
  styleUrl: './shipping-admin.css',
})
export class ShippingAdmin implements OnInit {
  shipments: any[] = [];
  carriers: any[] = [];
  isLoading = false;

  // Create modal
  isCreateOpen = false;
  createData = { orderId: '', weightKg: '', widthCm: '', heightCm: '', lengthCm: '', destination: '', recipientEmail: '', recipientName: '', carrierId: '' };
  createError: string | null = null;
  createSuccess: string | null = null;

  // Status modal
  isStatusOpen = false;
  selectedShipment: any = null;
  newStatus = '';
  statusNote = '';
  statusError: string | null = null;

  // History modal
  isHistoryOpen = false;
  historyShipment: any = null;
  historyLogs: any[] = [];
  historyLoading = false;

  // Return modal
  isReturnOpen = false;
  returnShipment: any = null;
  returnReason = '';
  returnError: string | null = null;
  returnSuccess: string | null = null;

  // Edit shipment modal
  isEditOpen = false;
  editShipment: any = null;
  editError: string | null = null;
  editSuccess: string | null = null;

  allStatuses = ['READY_TO_SHIP', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURN_REQUESTED', 'RETURN_SHIPPED', 'RETURNED'];

  constructor(
    private shippingService: ShippingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.isLoading = true;
    this.shippingService.getAllShipments().subscribe(data => {
      this.shipments = data;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
    this.shippingService.getAllCarriers().subscribe(data => {
      this.carriers = data;
      this.cdr.detectChanges();
    });
  }

  // ── Create ──────────────────────────────────────────────────
  openCreate() { this.isCreateOpen = true; this.createError = null; this.createSuccess = null; }
  closeCreate() { this.isCreateOpen = false; }

  submitCreate() {
    this.createError = null;
    const payload: any = {
      orderId: Number(this.createData.orderId),
      weightKg: Number(this.createData.weightKg),
      widthCm: Number(this.createData.widthCm),
      heightCm: Number(this.createData.heightCm),
      lengthCm: Number(this.createData.lengthCm),
      destination: this.createData.destination,
      recipientEmail: this.createData.recipientEmail,
      recipientName: this.createData.recipientName,
    };
    if (this.createData.carrierId) payload.carrierId = Number(this.createData.carrierId);

    this.shippingService.createShipment(payload).subscribe({
      next: () => {
        this.createSuccess = 'Livraison créée avec succès !';
        this.cdr.detectChanges();
        setTimeout(() => { this.closeCreate(); this.loadAll(); }, 1500);
      },
      error: (err) => {
        this.createError = err.error?.error || err.error || 'Erreur lors de la création.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Status ──────────────────────────────────────────────────
  openStatus(shipment: any) {
    this.selectedShipment = shipment;
    this.newStatus = '';
    this.statusNote = '';
    this.statusError = null;
    this.isStatusOpen = true;
  }

  getNextStatuses(currentStatus: string): string[] {
    const transitions: any = {
      'READY_TO_SHIP':    ['SHIPPED'],
      'SHIPPED':          ['IN_TRANSIT'],
      'IN_TRANSIT':       ['DELIVERED'],
      'DELIVERED':        ['RETURN_REQUESTED'],
      'RETURN_REQUESTED': ['RETURN_SHIPPED'],
      'RETURN_SHIPPED':   ['RETURNED'],
      'RETURNED':         []
    };
    return transitions[currentStatus] || [];
  }
  closeStatus() { this.isStatusOpen = false; }

  submitStatus() {
    if (!this.newStatus) { this.statusError = 'Veuillez choisir un statut.'; return; }
    this.shippingService.updateStatus(this.selectedShipment.id, this.newStatus, 'admin', this.statusNote).subscribe({
      next: () => { this.closeStatus(); this.loadAll(); },
      error: (err) => {
        this.statusError = err.error?.error || err.error || 'Transition de statut invalide.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── History ─────────────────────────────────────────────────
  openHistory(shipment: any) {
    this.historyShipment = shipment;
    this.historyLogs = [];
    this.historyLoading = true;
    this.isHistoryOpen = true;
    this.shippingService.getShipmentHistory(shipment.id).subscribe({
      next: (logs) => {
        this.historyLogs = logs;
        this.historyLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.historyLoading = false; this.cdr.detectChanges(); }
    });
  }
  closeHistory() { this.isHistoryOpen = false; }

  // ── Return ──────────────────────────────────────────────────
  openReturn(shipment: any) {
    this.returnShipment = shipment;
    this.returnReason = '';
    this.returnError = null;
    this.returnSuccess = null;
    this.isReturnOpen = true;
  }
  closeReturn() { this.isReturnOpen = false; }

  submitReturn() {
    if (!this.returnReason.trim()) { this.returnError = 'Veuillez indiquer la raison du retour.'; return; }
    this.shippingService.requestReturn(this.returnShipment.id, this.returnReason, 'admin').subscribe({
      next: () => {
        this.returnSuccess = 'Retour demandé avec succès.';
        this.cdr.detectChanges();
        setTimeout(() => { this.closeReturn(); this.loadAll(); }, 1500);
      },
      error: (err) => {
        this.returnError = err.error?.error || err.error || 'Erreur lors de la demande de retour.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Edit Shipment ────────────────────────────────────────────
  openEdit(shipment: any) {
    this.editShipment = { ...shipment };
    this.editError = null;
    this.editSuccess = null;
    this.isEditOpen = true;
  }
  closeEdit() { this.isEditOpen = false; }

  submitEdit() {
    this.editError = null;
    const payload = {
      orderId: this.editShipment.orderId,
      recipientName: this.editShipment.recipientName,
      recipientEmail: this.editShipment.recipientEmail,
      destination: this.editShipment.destination,
      weightKg: Number(this.editShipment.weightKg),
      widthCm: Number(this.editShipment.widthCm),
      heightCm: Number(this.editShipment.heightCm),
      lengthCm: Number(this.editShipment.lengthCm),
    };
    this.shippingService.updateShipment(this.editShipment.id, payload).subscribe({
      next: () => {
        this.editSuccess = 'Livraison mise à jour !';
        this.cdr.detectChanges();
        setTimeout(() => { this.closeEdit(); this.loadAll(); }, 1200);
      },
      error: (err) => {
        this.editError = err.error?.error || err.error || 'Erreur lors de la mise à jour.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Delete ──────────────────────────────────────────────────
  deleteShipment(id: number) {    if (confirm('Supprimer cette livraison ?')) {
      this.shippingService.deleteShipment(id).subscribe(() => {
        this.shipments = this.shipments.filter(s => s.id !== id);
        this.cdr.detectChanges();
      });
    }
  }

  getStatusClass(status: string): string {
    const map: any = {
      READY_TO_SHIP: 'badge-blue', SHIPPED: 'badge-orange',
      IN_TRANSIT: 'badge-yellow', DELIVERED: 'badge-green',
      RETURN_REQUESTED: 'badge-red', RETURN_SHIPPED: 'badge-purple', RETURNED: 'badge-gray'
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      READY_TO_SHIP: 'Prêt', SHIPPED: 'Expédié', IN_TRANSIT: 'En transit',
      DELIVERED: 'Livré', RETURN_REQUESTED: 'Retour demandé',
      RETURN_SHIPPED: 'Retour expédié', RETURNED: 'Retourné'
    };
    return map[status] || status;
  }

  onLogout() { this.router.navigate(['/login']); }
}
