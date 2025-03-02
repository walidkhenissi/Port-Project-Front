import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryBalanceService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/beneficiaryBalance/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/beneficiaryBalance/find', criteria, {withCredentials: true});
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/beneficiaryBalance/get?id=' + id);
  }

  public update(beneficiaryBalance: any) {
    return this.httpClient.put('/beneficiaryBalance/update', beneficiaryBalance);
  }

  create(beneficiaryBalance: any) {
    return this.httpClient.post('/beneficiaryBalance/create', beneficiaryBalance, {withCredentials: true});
  }

  remove(id: string | number) {
    return this.httpClient.delete('/beneficiaryBalance/remove?id=' + id);
  }
}
