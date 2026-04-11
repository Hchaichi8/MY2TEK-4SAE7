import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../Service/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {
  userData: any = null;
  
  // Variables pour le Modal
  isModalOpen: boolean = false;
  editData = {
    firstName: '',
    lastName: '',
    phone: ''
  };

  constructor(private userService: User, private router: Router,     private cdr: ChangeDetectorRef 
) {}

  ngOnInit() {
    this.userData = this.userService.getUserInfo();
    if (!this.userData) {
      this.router.navigate(['/login']); 
    } else {
      this.editData.firstName = this.userData.firstName || '';
      this.editData.lastName = this.userData.lastName || '';
      this.editData.phone = this.userData.phone || '';
    }
  }

  onLogout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  // --- LOGIQUE DU MODAL ---
  
  openModal() {
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden'; 
  }

  closeModal(event?: Event) {
    if (event && (event.target as HTMLElement).classList.contains('modal-content')) {
      return;
    }
    
    this.isModalOpen = false;
    document.body.style.overflow = 'auto'; 
  }

saveProfile() {
  if (!this.userData?.id) return;

  this.userService.updateUser(this.userData.id, this.editData).subscribe({
    next: (res: any) => {
      console.log("Update et Nouveau Token reçus !", res);
      
      // 1. ON SAUVEGARDE LE NOUVEAU TOKEN (C'est le secret !)
      this.userService.saveToken(res.token);
      
      // 2. ON RE-DÉCODE LE TOKEN POUR METTRE À JOUR L'AFFICHAGE
      // Comme ça, userData contient les nouveaux firstName/lastName
      this.userData = this.userService.getUserInfo();
      
      this.closeModal();
                this.cdr.detectChanges(); 

      // Le message "Profil incomplet" disparaîtra tout seul car userData est à jour
    },
    error: (err) => {
      console.error("Erreur update", err);
      alert("Erreur lors de la mise à jour.");
    }
  });
}
}