import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class CommissionService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/commission/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/commission/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/commission/get?id=' + id);
  }

  public update(commission: any) {
    return this.httpClient.put('/commission/update', commission);
  }

  create(commission: any) {
    return this.httpClient.post('/commission/create', commission);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/commission/remove?id=' + id);
  }

  public getAvailableCommissionsAtDate(criteria: any) {
    return this.httpClient.post('/commission/getAvailableCommissionsAtDate', criteria);
  }

}
