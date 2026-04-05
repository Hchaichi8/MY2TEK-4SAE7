import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShippingService {
  private apiUrl = 'http://localhost:8085';

  constructor(private http: HttpClient) {}

  // ── Shipments ──────────────────────────────────────────────
  createShipment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/shipments`, data);
  }

  getAllShipments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/shipments`);
  }

  getShipmentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/shipments/${id}`);
  }

  trackShipment(trackingNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/shipments/track/${trackingNumber}`);
  }

  getShipmentsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/shipments/status/${status}`);
  }

  updateStatus(id: number, status: string, changedBy: string = 'admin', note: string = ''): Observable<any> {
    return this.http.put(`${this.apiUrl}/shipments/${id}/status`, { status, changedBy, note });
  }

  updateShipment(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/shipments/${id}`, data);
  }

  requestReturn(shipmentId: number, reason: string, requestedBy: string = 'client'): Observable<any> {
    return this.http.post(`${this.apiUrl}/shipments/return`, { shipmentId, reason, requestedBy });
  }

  getShipmentHistory(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/shipments/${id}/history`);
  }

  getHistoryByTracking(trackingNumber: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/shipments/track/${trackingNumber}/history`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shipments/stats`);
  }

  getDeliveryEstimate(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shipments/${id}/delivery-estimate`);
  }

  quickEstimate(carrier: string, destination: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shipments/estimate?carrier=${carrier}&destination=${destination}`);
  }

  deleteShipment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/shipments/${id}`, { responseType: 'text' });
  }

  // ── Carriers ───────────────────────────────────────────────
  getAllCarriers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/carriers`);
  }

  createCarrier(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/carriers`, data);
  }

  updateCarrier(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/carriers/${id}`, data);
  }

  deleteCarrier(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/carriers/${id}`, { responseType: 'text' });
  }
}
