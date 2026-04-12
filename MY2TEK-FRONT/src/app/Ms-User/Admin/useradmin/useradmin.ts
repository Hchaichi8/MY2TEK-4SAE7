import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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

  // Edit modal
  selectedUser: any = null;
  editData = { firstName: '', lastName: '', phone: '', location: '', zipCode: '' };
  isSaving = false;
  editError = '';

  private readonly GATEWAY = 'http://localhost:8085';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
  this.isLoading = true;
  // ← changed from /users to /users/keycloak/all
  this.http.get<any[]>(`${this.GATEWAY}/users/keycloak/all`).subscribe({
    next: (data) => {
      // Keycloak returns createdAt as a timestamp (milliseconds) — convert it
      this.users = data.map(u => ({
        ...u,
        createdAt: u.createdAt ? new Date(u.createdAt) : null
      }));
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Failed to load users from Keycloak:', err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  deleteUser(keycloakId: string) {
    if (!confirm('Supprimer cet utilisateur de la plateforme ET de Keycloak ?')) return;

    this.http.delete(`${this.GATEWAY}/users/${keycloakId}`).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.keycloakId !== keycloakId);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Delete failed:', err)
    });
  }

  openEdit(user: any) {
    this.selectedUser = user;
    this.editData = {
      firstName: user.firstName || '',
      lastName:  user.lastName  || '',
      phone:     user.phone     || '',
      location:  user.location  || '',
      zipCode:   user.zipCode   || ''
    };
    this.editError = '';
    this.isSaving = false;
  }

  closeEdit() { this.selectedUser = null; }

  saveEdit() {
    if (!this.selectedUser) return;
    this.isSaving = true;
    this.editError = '';

    this.http.put(`${this.GATEWAY}/users/${this.selectedUser.keycloakId}`, this.editData).subscribe({
      next: (updated: any) => {
        // Update local list
        const idx = this.users.findIndex(u => u.keycloakId === this.selectedUser.keycloakId);
        if (idx !== -1) this.users[idx] = { ...this.users[idx], ...updated };
        this.isSaving = false;
        this.selectedUser = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.editError = 'Erreur lors de la mise à jour.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  onLogout() {
    sessionStorage.clear();
    this.keycloakService.logout(window.location.origin + '/login');
  }
}