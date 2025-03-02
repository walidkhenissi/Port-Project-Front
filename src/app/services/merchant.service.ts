import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, map} from 'rxjs/operators';
import {Observable, throwError as observableThrowError, throwError} from 'rxjs';
import {Merchant} from '../models/merchant';
import {HttpClientService} from "../utils/http-client.service";
import {Shipowner} from "../models/shipowner";
import {IService} from "./IService";

@Injectable({
  providedIn: 'root'
})
export class MerchantsService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/merchant/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/merchant/find', criteria, {withCredentials: true});
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/merchant/get?id=' + id);
  }

  public update(merchant: Merchant) {
    return this.httpClient.put('/merchant/update', merchant);
  }

  public remove(id: string | number) {
    return this.httpClient.delete('/merchant/remove?id=' + id);
  }

  create(merchant: Merchant) {
    return this.httpClient.post('/merchant/create', merchant, {withCredentials: true}).pipe(
      map((data: any) => {
        console.log(data)
      }), catchError(res => observableThrowError(res)));
  }


}
