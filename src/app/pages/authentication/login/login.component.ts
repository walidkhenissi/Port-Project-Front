import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class AppSideLoginComponent {

  model: any = {};
  user: User;
  returnUrl: string;

  constructor(private route: ActivatedRoute, private router: Router, private userService: UsersService) { }

  onSubmit() {
    this.login();
  }

  login() {
    console.log(this.model);
    this.userService.login({ username: this.model.username, password: this.model.password })
      .subscribe(response => {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([this.returnUrl]);
      }, error => {
        console.error(error);
      });

  }
}
