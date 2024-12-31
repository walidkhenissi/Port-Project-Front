import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class SaleService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/sale/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/sale/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/sale/get?id=' + id);
  }

  public update(sale: any) {
    return this.httpClient.put('/sale/update', sale);
  }

  create(sale: any) {
    return this.httpClient.post('/sale/create', sale);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/sale/remove?id=' + id);
  }

  public getSaleWithDetails(id: string | number) {
    return this.httpClient.get('/sale/getSaleWithDetails?id=' + id);
  }

  public generateSalesReport(options: any) {
    return this.httpClient.post('/sale/generateSalesReport', options);
  }
}
