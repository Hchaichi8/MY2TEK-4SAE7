import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../Service/user';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute, 
    private authService: User, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Récupère l'email depuis l'URL : ?email=...
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      this.errorMessage = "Lien invalide. Veuillez recommencer la procédure.";
    }
  }

  onReset() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = "Les mots de passe ne correspondent pas.";
      return;
    }

    this.errorMessage = null;
    this.isLoading = true;

    const payload = { email: this.email, newPassword: this.newPassword };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = "Mot de passe modifié ! Redirection vers la connexion...";
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || "Erreur lors de la réinitialisation.";
        this.cdr.detectChanges();
      }
    });
  }
}