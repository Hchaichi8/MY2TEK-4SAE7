import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../Service/product';

@Component({
  selector: 'app-edit-product',
  standalone: false,
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
})
export class EditProduct implements OnInit {

  productId!: number;
  productData: any = {
    name: '',
    description: '',
    price: null,
    stockQuantity: null,
    imageUrl: '',
    category: '',
    brand: '',
  };

  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(this.productId).subscribe(data => {
      this.productData = { ...data };
      this.cdr.detectChanges();
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.productData.imageUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    this.errorMessage = null;
    this.isLoading = true;

    this.productService.updateProduct(this.productId, this.productData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Produit mis à jour avec succès !';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/product-list']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'Erreur lors de la mise à jour.';
        this.cdr.detectChanges();
      }
    });
  }

  onCancel() {
    this.router.navigate(['/product-list']);
  }
}
