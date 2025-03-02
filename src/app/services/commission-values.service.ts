import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class CommissionValuesService implements IService {
  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/commissionValueController/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/commissionValueController/find', criteria, {withCredentials: true});
  }

  public findWithDetails(criteria: any) {
    return this.httpClient.post('/commissionValueController/findWithDetails', criteria, {withCredentials: true});
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/commissionValueController/get?id=' + id);
  }

  public update(commissionValue: any) {
    return this.httpClient.put('/commissionValueController/update', commissionValue);
  }

  create(commissionValue: any) {
    return this.httpClient.post('/commissionValueController/create', commissionValue, {withCredentials: true});
  }

  remove(id: string | number) {
    return this.httpClient.delete('/commissionValueController/remove?id=' + id);
  }
}
