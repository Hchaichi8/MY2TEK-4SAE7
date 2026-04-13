import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-useradmin',
  standalone: false,
  templateUrl: './useradmin.html',
  styleUrl: './useradmin.css',
})
export class Useradmin implements OnInit {
  users: any[] = [];
  isLoading = true;

  private readonly GATEWAY = 'http://localhost:8085';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  private getToken(): string {
    const session = sessionStorage.getItem('kc_token');
    if (session) return session;
    return this.keycloakService.getKeycloakInstance().token ?? '';
  }

loadUsers() {
  this.isLoading = true;

  // ✅ GET /users is public — no token needed
  this.http.get<any[]>(`${this.GATEWAY}/users`).subscribe({
    next: (data) => {
      this.users = data;
      this.isLoading = false;
      this.cdr.detectChanges();
      console.log('✅ Users loaded:', this.users.length);
    },
    error: (err) => {
      console.error('Failed to load users:', err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}
deleteUser(keycloakId: string) {
  if (!confirm('Supprimer cet utilisateur ?')) return;

  // ✅ No token needed — public endpoint
  this.http.delete(`${this.GATEWAY}/users/${keycloakId}`).subscribe({
    next: () => {
      this.users = this.users.filter(u => u.keycloakId !== keycloakId);
      this.cdr.detectChanges();
      console.log('✅ User deleted');
    },
    error: (err) => console.error('Delete failed:', err)
  });
}

  onLogout() {
    sessionStorage.clear();
    localStorage.clear();
    this.keycloakService.logout(window.location.origin + '/login');
  }
}