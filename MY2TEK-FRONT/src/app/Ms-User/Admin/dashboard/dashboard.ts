import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../../Service/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard  implements OnInit {
  users: any[] = [];

  constructor(private userService: User,  private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.userService.getAllUsers().subscribe(data => {
      this.users = data;
                this.cdr.detectChanges();

    });
  }

onLogout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}