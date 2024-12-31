import { Injectable } from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class CommissionBeneficiaryService implements IService {
  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/commissionBeneficiary/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/commissionBeneficiary/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/commissionBeneficiary/get?id=' + id);
  }

  public update(commission: any) {
    return this.httpClient.put('/commissionBeneficiary/update', commission);
  }

  create(commission: any) {
    return this.httpClient.post('/commissionBeneficiary/create', commission);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/commissionBeneficiary/remove?id=' + id);
  }
}
