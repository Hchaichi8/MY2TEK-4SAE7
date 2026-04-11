import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private apiUrl = 'http://localhost:8086/products';

  constructor(private http: HttpClient) {}

  getAllProducts(page = 0, size = 10, sort = 'createdAt,desc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    return this.http.get<any>(this.apiUrl, { params });
  }

  searchProducts(filters: {
    name?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    size?: number;
    sort?: string;
  }): Observable<any> {
    let params = new HttpParams();
    if (filters.name)      params = params.set('name', filters.name);
    if (filters.category)  params = params.set('category', filters.category);
    if (filters.brand)     params = params.set('brand', filters.brand);
    if (filters.minPrice != null) params = params.set('minPrice', filters.minPrice);
    if (filters.maxPrice != null) params = params.set('maxPrice', filters.maxPrice);
    if (filters.inStock != null)  params = params.set('inStock', filters.inStock);
    params = params.set('page', filters.page ?? 0);
    params = params.set('size', filters.size ?? 10);
    params = params.set('sort', filters.sort ?? 'createdAt,desc');
    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/brands`);
  }
}
