import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class ArticleService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/article/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/article/find', criteria, {withCredentials: true});
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/article/get?id=' + id);
  }

  public update(article: any) {
    return this.httpClient.put('/article/update', article);
  }

  create(article: any) {
    return this.httpClient.post('/article/create', article, {withCredentials: true});
  }

  remove(id: string | number) {
    return this.httpClient.delete('/article/remove?id=' + id);
  }
}
