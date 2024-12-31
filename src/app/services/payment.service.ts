import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class PaymentService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/payment/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/payment/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/payment/get?id=' + id);
  }

  public update(payment: any) {
    return this.httpClient.put('/payment/update', payment);
  }

  create(payment: any) {
    return this.httpClient.post('/payment/create', payment);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/payment/remove?id=' + id);
  }
}
