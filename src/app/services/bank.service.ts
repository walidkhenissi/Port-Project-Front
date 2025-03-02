import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class BankService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/bank/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/bank/find', criteria, {withCredentials: true});
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/bank/get?id=' + id);
  }

  public update(bank: any) {
    return this.httpClient.put('/bank/update', bank);
  }

  create(bank: any) {
    return this.httpClient.post('/bank/create', bank, {withCredentials: true});
  }

  remove(id: string | number) {
    return this.httpClient.delete('/bank/remove?id=' + id);
  }
}
