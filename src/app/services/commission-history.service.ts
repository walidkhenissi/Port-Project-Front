import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class CommissionHistoryService implements IService {
  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/commissionHistory/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/commissionHistory/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/commissionHistory/get?id=' + id);
  }

  public update(commission: any) {
    return this.httpClient.put('/commissionHistory/update', commission);
  }

  create(commission: any) {
    return this.httpClient.post('/commissionHistory/create', commission);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/commissionHistory/remove?id=' + id);
  }
}
