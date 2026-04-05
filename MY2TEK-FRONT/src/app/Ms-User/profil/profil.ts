import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {
  userData: KeycloakProfile | null = null;
  userRoles: string[] = [];
  localProfile: any = null;
  myReviews: any[] = [];        
  activeTab: string = 'profile'; 

  isModalOpen = false;
  editData = { firstName: '', lastName: '', phone: '', zipCode: '', location: '' };

  private readonly GATEWAY = 'http://localhost:8085';

  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
  ) {}

  async ngOnInit() {
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    if (!isLoggedIn) { this.keycloakService.login(); return; }

    this.userData = await this.keycloakService.loadUserProfile();
    this.userRoles = this.keycloakService.getUserRoles();

    this.editData.firstName = this.userData.firstName || '';
    this.editData.lastName  = this.userData.lastName  || '';

    const token = this.getToken();

    // Load local profile
    this.http.get(`${this.GATEWAY}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (profile: any) => {
        this.localProfile      = profile;
        this.editData.phone    = profile.phone    || '';
        this.editData.zipCode  = profile.zipCode  || '';
        this.editData.location = profile.location || '';
        this.cdr.detectChanges();
      },
      error: (e) => console.warn('Could not load local profile:', e)
    });

    // ✅ Load my reviews via OpenFeign
    this.loadMyReviews(token);

    this.cdr.detectChanges();
  }

  // ✅ Get token from sessionStorage or Keycloak instance
  private getToken(): string {
    const session = sessionStorage.getItem('kc_token');
    if (session) return session;
    return this.keycloakService.getKeycloakInstance().token ?? '';
  }

  // ✅ Calls UserMicroService → OpenFeign → ReviewMicroservice
  loadMyReviews(token: string) {
    this.http.get<any>(`${this.GATEWAY}/users/me/reviews`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        this.myReviews = res.reviews || [];
        console.log('✅ My reviews loaded:', this.myReviews.length);
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('Could not load reviews:', err)
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  onLogout() {
    sessionStorage.clear();
    localStorage.clear();
    this.keycloakService.logout(window.location.origin + '/login');
  }

  openModal()  { this.isModalOpen = true; }
  closeModal(event?: Event) {
    if (event && (event.target as HTMLElement).classList.contains('modal-content')) return;
    this.isModalOpen = false;
  }

  async saveProfile() {
    const token = this.getToken();

    this.http.post(
      `http://localhost:8100/realms/MY2TEK-realm/account`,
      {
        id:        this.userData?.id,
        username:  this.userData?.username,
        email:     this.userData?.email,
        firstName: this.editData.firstName,
        lastName:  this.editData.lastName,
      },
      { headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })}
    ).subscribe();

    this.http.put(`${this.GATEWAY}/users/me`, this.editData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: async () => {
        this.userData    = await this.keycloakService.loadUserProfile();
        this.isModalOpen = false;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Update failed:', e)
    });
  }
}