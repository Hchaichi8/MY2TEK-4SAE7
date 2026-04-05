import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShippingService } from '../Service/shipping';

@Component({
  selector: 'app-track',
  standalone: false,
  templateUrl: './track.html',
  styleUrl: './track.css',
})
export class Track implements OnInit {
  trackingNumber: string = '';
  inputTracking: string = '';
  shipment: any = null;
  errorMessage: string | null = null;
  isLoading = false;

  steps = ['READY_TO_SHIP', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'];

  constructor(
    private route: ActivatedRoute,
    private shippingService: ShippingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const tn = this.route.snapshot.paramMap.get('trackingNumber');
    if (tn) {
      this.inputTracking = tn;
      this.search();
    }
  }

  search() {
    if (!this.inputTracking.trim()) return;
    this.isLoading = true;
    this.errorMessage = null;
    this.shipment = null;

    this.shippingService.trackShipment(this.inputTracking.trim()).subscribe({
      next: (data) => {
        this.shipment = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Aucun colis trouvé pour ce numéro de suivi.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStepIndex(): number {
    return this.steps.indexOf(this.shipment?.status);
  }

  getStepLabel(step: string): string {
    const labels: any = {
      READY_TO_SHIP: 'Prêt à expédier',
      SHIPPED: 'Expédié',
      IN_TRANSIT: 'En transit',
      DELIVERED: 'Livré'
    };
    return labels[step] || step;
  }

  stepIcon(step: string): string {
    const icons: any = {
      READY_TO_SHIP: 'fa-box',
      SHIPPED: 'fa-shipping-fast',
      IN_TRANSIT: 'fa-truck',
      DELIVERED: 'fa-check-circle'
    };
    return icons[step] || 'fa-circle';
  }
}
