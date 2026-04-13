import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {

  private readonly GATEWAY = 'http://localhost:8085';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private getToken(): string {
    const session = sessionStorage.getItem('kc_token');
    if (session) return session;
    return this.keycloakService.getKeycloakInstance().token ?? '';
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`
    });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.GATEWAY}/users`, {
      headers: this.getHeaders()
    });
  }

  deleteUser(keycloakId: string): Observable<void> {
    return this.http.delete<void>(`${this.GATEWAY}/users/${keycloakId}`, {
      headers: this.getHeaders()
    });
  }

  logout() {
    sessionStorage.clear();
    localStorage.clear();
    this.keycloakService.logout(window.location.origin + '/login');
  }
}