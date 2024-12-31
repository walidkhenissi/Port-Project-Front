import {Injectable} from '@angular/core';
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class GenericService {


  constructor(private httpClient: HttpClientService) {
  }

  public find(entity: any, criteria:any = null) {
    let param = {criteria: criteria, entity: entity};
    return this.httpClient.post('/generic/find', param);
  }

  public remove(entity: any, id: number) {
    return this.httpClient.delete('/generic/remove?entity=' + entity + '&id=' + id);
  }
}
