import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {LoadingSpinnerService} from "./services/loading-spinner.service";
import {Location} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'Amiche Poissons';

  constructor(public location: Location, private router: Router, private loadingSpinnerService: LoadingSpinnerService) {
  }

  ngOnInit() {

  }
}
