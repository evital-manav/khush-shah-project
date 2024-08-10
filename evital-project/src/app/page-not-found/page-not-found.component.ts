import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  constructor(private router: Router,
              private authService: AuthService,) { }

  ngOnInit(): void {
  }

  goBack(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']); // redirect to dashboard if logged in
    } else {
      this.router.navigate(['/login']); // redirect to login if not logged in
    }
  }
}
