import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../Service/product';

@Component({
  selector: 'app-add-product',
  standalone: false,
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {

  productData = {
    name: '',
    description: '',
    price: undefined as number | undefined,
    stockQuantity: undefined as number | undefined,
    imageUrl: '',
    category: '',
    brand: '',
  };

  imagePreview: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.productData.imageUrl = reader.result as string;
      this.imagePreview = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    this.errorMessage = null;
    this.isLoading = true;

    this.productService.createProduct(this.productData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Produit ajouté avec succès !';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/product-list']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'Erreur lors de la création du produit.';
        this.cdr.detectChanges();
      }
    });
  }

  onCancel() {
    this.router.navigate(['/product-list']);
  }
}
