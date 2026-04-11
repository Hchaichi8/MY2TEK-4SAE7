import { ChangeDetectorRef, Component } from '@angular/core';
import { User } from '../Service/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registre',
  standalone: false,
  templateUrl: './registre.html',
  styleUrl: './registre.css',
})
export class Registre {
  isLoginMode = true;
 userData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    location: ''
  };

  // Feedback UI
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  constructor(private authService: User, private router: Router, private cdr: ChangeDetectorRef) {}

  onRegister() {
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = true;

    this.authService.register(this.userData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Bienvenue chez MY2TEK ! Votre compte est prêt.';
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || "Une erreur est survenue lors de l'inscription.";
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
}