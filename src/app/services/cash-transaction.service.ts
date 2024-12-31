import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class CashTransactionService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/cashTransaction/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/cashTransaction/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/cashTransaction/get?id=' + id);
  }

  public update(cashTransaction: any) {
    return this.httpClient.put('/cashTransaction/update', cashTransaction);
  }

  create(cashTransaction: any) {
    return this.httpClient.post('/cashTransaction/create', cashTransaction);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/cashTransaction/remove?id=' + id);
  }
}
