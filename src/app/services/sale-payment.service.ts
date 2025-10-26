import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class SalePaymentService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/salePayment/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/salePayment/find', criteria);
  }

  public findWithDetails(criteria: any) {
    return this.httpClient.post('/salePayment/findWithDetails', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/salePayment/get?id=' + id);
  }

  public update(salePayment: any) {
    return this.httpClient.put('/salePayment/update', salePayment);
  }

  create(salePayment: any) {
    return this.httpClient.post('/salePayment/create', salePayment);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/salePayment/remove?id=' + id);
  }
  public generateSalePaymentReport(options: any) {
    return this.httpClient.post('/salePayment/generateSalePaymentReport', options);
  }
}
