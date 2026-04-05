import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShippingService } from '../../Service/shipping';

@Component({
  selector: 'app-shipping-stats',
  standalone: false,
  templateUrl: './shipping-stats.html',
  styleUrl: './shipping-stats.css',
})
export class ShippingStats implements OnInit {
  stats: any = null;
  isLoading = true;

  // Quick estimate
  estimateCarrier = 'DHL';
  estimateDestination = '';
  estimateResult: any = null;
  estimateError: string | null = null;

  carriers = ['DHL', 'Aramex', 'Rapid Poste'];

  constructor(
    private shippingService: ShippingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadStats(); }

  loadStats() {
    this.isLoading = true;
    this.shippingService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  getCarrierEntries(): { name: string; count: number }[] {
    if (!this.stats?.shipmentsByCarrier) return [];
    return Object.entries(this.stats.shipmentsByCarrier).map(([name, count]) => ({
      name, count: count as number
    }));
  }

  getStatusEntries(): { status: string; count: number }[] {
    if (!this.stats?.shipmentsByStatus) return [];
    return Object.entries(this.stats.shipmentsByStatus).map(([status, count]) => ({
      status, count: count as number
    }));
  }

  getBarWidth(count: number, max: number): string {
    if (max === 0) return '0%';
    return Math.round((count / max) * 100) + '%';
  }

  getMaxCarrierCount(): number {
    const entries = this.getCarrierEntries();
    return entries.length ? Math.max(...entries.map(e => e.count)) : 1;
  }

  getMaxStatusCount(): number {
    const entries = this.getStatusEntries();
    return entries.length ? Math.max(...entries.map(e => e.count)) : 1;
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

  runEstimate() {
    if (!this.estimateDestination.trim()) {
      this.estimateError = 'Veuillez entrer une destination.';
      return;
    }
    this.estimateError = null;
    this.estimateResult = null;
    this.shippingService.quickEstimate(this.estimateCarrier, this.estimateDestination).subscribe({
      next: (data) => { this.estimateResult = data; this.cdr.detectChanges(); },
      error: () => { this.estimateError = 'Erreur lors du calcul.'; this.cdr.detectChanges(); }
    });
  }

  onLogout() { this.router.navigate(['/login']); }
}
