import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/beneficiary/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/beneficiary/find', criteria, {withCredentials: true});
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/beneficiary/get?id=' + id);
  }

  public update(beneficiary: any) {
    return this.httpClient.put('/beneficiary/update', beneficiary);
  }

  create(beneficiary: any) {
    return this.httpClient.post('/beneficiary/create', beneficiary, {withCredentials: true});
  }

  remove(id: string | number) {
    return this.httpClient.delete('/beneficiary/remove?id=' + id);
  }
}
