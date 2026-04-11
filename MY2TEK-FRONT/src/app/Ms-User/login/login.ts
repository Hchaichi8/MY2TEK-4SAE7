import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../Service/user';
import { Router } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {loginData = { email: '', password: '' };
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  constructor(
    private authService: User, 
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private socialAuthService: SocialAuthService
  ) {}

  ngOnInit() {
    // S'active automatiquement quand l'utilisateur finit le process Google
    this.socialAuthService.authState.subscribe((user) => {
      if (user && user.idToken) {
        console.log("Token Google reçu, envoi au backend...");
        this.loginWithGoogle(user.idToken);
      }
    });
  }

onLogin() {
  this.errorMessage = null;
  this.isLoading = true;

  // VERIFICATION STATIQUE ADMIN
  if (this.loginData.email === 'admin' && this.loginData.password === 'my2tekadmin88') {
    this.isLoading = false;
    this.successMessage = 'Accès Admin Maître autorisé...';
    
    
    this.cdr.detectChanges();
    setTimeout(() => {
      this.router.navigate(['user-admin']);
    }, 1000);
    return; // On arrête l'exécution ici, pas besoin d'appeler le backend
  }

  // LOGIN NORMAL POUR LES CLIENTS
  this.authService.login(this.loginData).subscribe({
    next: (res: any) => this.handleSuccess(res),
    error: (err) => this.handleError(err)
  });
}

  loginWithGoogle(token: string) {
    this.isLoading = true;
    this.authService.loginWithGoogleBackend(token).subscribe({
      next: (res: any) => this.handleSuccess(res),
      error: (err) => this.handleError(err)
    });
  }

  private handleSuccess(response: any) {
    this.isLoading = false;
    this.successMessage = 'Connexion réussie ! Redirection...';
    this.authService.saveToken(response.token);
    this.cdr.detectChanges();
    setTimeout(() => this.router.navigate(['/Profil']), 1500);
  }

  private handleError(err: any) {
    this.isLoading = false;
    this.errorMessage = err.error?.message || err.error || 'Échec de la connexion.';
    this.cdr.detectChanges();
  }
}