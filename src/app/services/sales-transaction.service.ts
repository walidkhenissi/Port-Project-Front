import { Injectable } from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class SalesTransactionService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/salesTransaction/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/salesTransaction/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/salesTransaction/get?id=' + id);
  }

  public update(salesTransaction: any) {
    return this.httpClient.put('/salesTransaction/update', salesTransaction);
  }

  create(salesTransaction: any) {
    return this.httpClient.post('/salesTransaction/create', salesTransaction);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/salesTransaction/remove?id=' + id);
  }

  // Fonction pour récupérer les transactions
 suivi(){
    return this.httpClient.get('/salesTransaction/filter');
  }
  public generateSalesTransactionReport(options: any) {
    return this.httpClient.post('/salesTransaction/generateSalestransactionReport', options);
  }

}
