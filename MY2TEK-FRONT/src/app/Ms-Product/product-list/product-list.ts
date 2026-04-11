import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../Service/product';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {

  products: any[] = [];
  categories: string[] = [];
  brands: string[] = [];

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Filters
  filters = {
    name: '',
    category: '',
    brand: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    inStock: undefined as boolean | undefined,
    sort: 'createdAt,desc',
  };

  isSearchActive = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    this.loadBrands();
  }

  loadProducts() {
    this.productService.getAllProducts(this.currentPage, this.pageSize, this.filters.sort).subscribe(data => {
      this.products = data.content;
      this.totalPages = data.totalPages;
      this.totalElements = data.totalElements;
      this.cdr.detectChanges();
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe(data => {
      this.categories = data;
      this.cdr.detectChanges();
    });
  }

  loadBrands() {
    this.productService.getBrands().subscribe(data => {
      this.brands = data;
      this.cdr.detectChanges();
    });
  }

  onSearch() {
    this.currentPage = 0;
    const hasFilter = this.filters.name || this.filters.category || this.filters.brand
      || this.filters.minPrice !== undefined || this.filters.maxPrice !== undefined || this.filters.inStock !== undefined;

    if (hasFilter) {
      this.isSearchActive = true;
      this.productService.searchProducts({ ...this.filters, page: this.currentPage, size: this.pageSize }).subscribe(data => {
        this.products = data.content;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.cdr.detectChanges();
      });
    } else {
      this.isSearchActive = false;
      this.loadProducts();
    }
  }

  onSortChange() {
    this.currentPage = 0;
    this.isSearchActive ? this.onSearch() : this.loadProducts();
  }

  resetFilters() {
    this.filters = { name: '', category: '', brand: '', minPrice: undefined, maxPrice: undefined, inStock: undefined, sort: 'createdAt,desc' };
    this.isSearchActive = false;
    this.currentPage = 0;
    this.loadProducts();
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.isSearchActive ? this.onSearch() : this.loadProducts();
  }

  deleteProduct(id: number) {
    if (confirm('Supprimer ce produit ?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.products = this.products.filter(p => p.id !== id);
        this.cdr.detectChanges();
      });
    }
  }

  goToAdd() {
    this.router.navigate(['/product-add']);
  }

  goToEdit(id: number) {
    this.router.navigate(['/product-edit', id]);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
