import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShippingService } from '../../Service/shipping';

@Component({
  selector: 'app-carriers-admin',
  standalone: false,
  templateUrl: './carriers-admin.html',
  styleUrl: './carriers-admin.css',
})
export class CarriersAdmin implements OnInit {
  carriers: any[] = [];

  // Add modal
  isModalOpen = false;
  newCarrier = { name: '', basePrice: '', pricePerKg: '', maxWeightKg: '' };
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Edit modal
  isEditOpen = false;
  editCarrier: any = null;
  editError: string | null = null;
  editSuccess: string | null = null;

  constructor(
    private shippingService: ShippingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadCarriers(); }

  loadCarriers() {
    this.shippingService.getAllCarriers().subscribe(data => {
      this.carriers = data;
      this.cdr.detectChanges();
    });
  }

  // ── Add ─────────────────────────────────────────────────────
  openModal() {
    this.isModalOpen = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.newCarrier = { name: '', basePrice: '', pricePerKg: '', maxWeightKg: '' };
  }
  closeModal() { this.isModalOpen = false; }

  submitCarrier() {
    this.errorMessage = null;
    const payload = {
      name: this.newCarrier.name,
      basePrice: Number(this.newCarrier.basePrice),
      pricePerKg: Number(this.newCarrier.pricePerKg),
      maxWeightKg: Number(this.newCarrier.maxWeightKg),
    };
    this.shippingService.createCarrier(payload).subscribe({
      next: () => {
        this.successMessage = 'Transporteur ajouté !';
        this.cdr.detectChanges();
        setTimeout(() => { this.closeModal(); this.loadCarriers(); }, 1200);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors de la création.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Edit ─────────────────────────────────────────────────────
  openEdit(carrier: any) {
    this.editCarrier = { ...carrier };
    this.editError = null;
    this.editSuccess = null;
    this.isEditOpen = true;
  }
  closeEdit() { this.isEditOpen = false; }

  submitEdit() {
    this.editError = null;
    const payload = {
      name: this.editCarrier.name,
      basePrice: Number(this.editCarrier.basePrice),
      pricePerKg: Number(this.editCarrier.pricePerKg),
      maxWeightKg: Number(this.editCarrier.maxWeightKg),
    };
    this.shippingService.updateCarrier(this.editCarrier.id, payload).subscribe({
      next: () => {
        this.editSuccess = 'Transporteur mis à jour !';
        this.cdr.detectChanges();
        setTimeout(() => { this.closeEdit(); this.loadCarriers(); }, 1200);
      },
      error: (err) => {
        this.editError = err.error?.error || 'Erreur lors de la mise à jour.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Delete ───────────────────────────────────────────────────
  deleteCarrier(id: number) {
    if (confirm('Supprimer ce transporteur ?')) {
      this.shippingService.deleteCarrier(id).subscribe(() => {
        this.carriers = this.carriers.filter(c => c.id !== id);
        this.cdr.detectChanges();
      });
    }
  }

  onLogout() { this.router.navigate(['/login']); }
}
