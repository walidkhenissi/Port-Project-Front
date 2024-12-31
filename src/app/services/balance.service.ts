import { Injectable } from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class BalanceService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/balance/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/balance/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/balance/get?id=' + id);
  }

  public update(balance: any) {
    return this.httpClient.put('/balance/update', balance);
  }

  create(balance: any) {
    return this.httpClient.post('/balance/create', balance);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/balance/remove?id=' + id);
  }
}
