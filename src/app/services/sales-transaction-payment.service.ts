import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class SalesTransactionPaymentService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/salesTransactionPayment/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/salesTransactionPayment/find', criteria);
  }

  public findWithDetails(criteria: any) {
    return this.httpClient.post('/salesTransactionPayment/findWithDetails', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/salesTransactionPayment/get?id=' + id);
  }

  public update(salesTransactionPayment: any) {
    return this.httpClient.put('/salesTransactionPayment/update', salesTransactionPayment);
  }

  create(salesTransactionPayment: any) {
    return this.httpClient.post('/salesTransactionPayment/create', salesTransactionPayment);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/salesTransactionPayment/remove?id=' + id);
  }
}
