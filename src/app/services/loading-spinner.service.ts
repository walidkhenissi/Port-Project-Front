import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingSpinnerService {
  public isLoading: boolean = false;

  constructor() {
  }

  public setIsLoading(loading: boolean) {
    setTimeout(() => {
      this.isLoading = loading;
    });
  }
}
