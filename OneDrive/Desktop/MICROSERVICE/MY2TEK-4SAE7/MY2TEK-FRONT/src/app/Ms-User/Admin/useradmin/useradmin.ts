import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../Service/user';

@Component({
  selector: 'app-useradmin',
  standalone: false,
  templateUrl: './useradmin.html',
  styleUrl: './useradmin.css',
})
export class Useradmin  implements OnInit {
  users: any[] = [];

  constructor(private userService: User, private router: Router,    private cdr: ChangeDetectorRef,
) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(data => {
      this.users = data;
          this.cdr.detectChanges();

    });
  }

  deleteUser(id: number) {
    if(confirm("Supprimer cet utilisateur ?")) {
      this.userService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(u => u.id !== id);
            this.cdr.detectChanges();

      });
    }
  }

  onLogout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}