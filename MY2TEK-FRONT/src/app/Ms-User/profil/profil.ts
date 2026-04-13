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

  // ✅ Edit review modal
  isReviewModalOpen = false;
  editingReview: any = null;
  editReviewData = { description: '', rating: 5 };

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

    this.loadMyReviews(token);
    this.cdr.detectChanges();
  }

  private getToken(): string {
    const session = sessionStorage.getItem('kc_token');
    if (session) return session;
    return this.keycloakService.getKeycloakInstance().token ?? '';
  }

  loadMyReviews(token: string) {
    this.http.get<any>(`${this.GATEWAY}/users/me/reviews`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        this.myReviews = res.reviews || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('Could not load reviews:', err)
    });
  }

  // ✅ Open edit review modal
  openEditReview(review: any) {
    this.editingReview = review;
    this.editReviewData = {
      description: review.description,
      rating: review.rating
    };
    this.isReviewModalOpen = true;
  }

  closeReviewModal() {
    this.isReviewModalOpen = false;
    this.editingReview = null;
  }

  // ✅ Save updated review
  saveReview() {
    if (!this.editingReview) return;
    const token = this.getToken();

    const payload = {
      id:          this.editingReview.id,
      description: this.editReviewData.description,
      rating:      this.editReviewData.rating,
      clientId:    this.editingReview.clientId,
      clientName:  this.editingReview.clientName,
      productId:   this.editingReview.productId,
      createdAt:   this.editingReview.createdAt
    };

    this.http.put(
      `${this.GATEWAY}/Review/UpdateMyReview/${this.editingReview.id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        console.log('✅ Review updated');
        this.isReviewModalOpen = false;
        this.editingReview = null;
        this.loadMyReviews(token); // refresh list
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Update review failed:', err)
    });
  }

  // ✅ Delete review
  deleteReview(reviewId: number) {
    if (!confirm('Voulez-vous vraiment supprimer cet avis ?')) return;
    const token = this.getToken();

    this.http.delete(
      `${this.GATEWAY}/Review/DeleteMyReview/${reviewId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        console.log('✅ Review deleted');
        this.myReviews = this.myReviews.filter(r => r.id !== reviewId);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Delete review failed:', err)
    });
  }

  // ✅ Set star rating in edit modal
  setEditRating(star: number) {
    this.editReviewData.rating = star;
  }

  setTab(tab: string) { this.activeTab = tab; }

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