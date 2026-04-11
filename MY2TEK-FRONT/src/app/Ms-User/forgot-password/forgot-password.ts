import { ChangeDetectorRef, Component } from '@angular/core';
import { User } from '../Service/user';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {email: string = '';
  
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  constructor(private authService: User, private cdr: ChangeDetectorRef) {}

  onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.email) {
      this.errorMessage = "Veuillez entrer votre adresse email.";
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = "Si cet email existe, un lien de réinitialisation a été envoyé.";
        this.email = ''; // On vide le champ
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || "Une erreur est survenue. Veuillez réessayer.";
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
}