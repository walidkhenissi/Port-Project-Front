import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class BoxesTransactionService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/boxesTransaction/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/boxesTransaction/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/boxesTransaction/get?id=' + id);
  }

  public update(boxesTransaction: any) {
    return this.httpClient.put('/boxesTransaction/update', boxesTransaction);
  }

  create(boxesTransaction: any) {
    return this.httpClient.post('/boxesTransaction/create', boxesTransaction);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/boxesTransaction/remove?id=' + id);
  }
}
