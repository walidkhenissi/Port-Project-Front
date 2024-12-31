import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, map} from 'rxjs/operators';
import {Observable, throwError as observableThrowError, throwError} from 'rxjs';
import {Shipowner} from '../models/shipowner';
import {HttpClientService} from "../utils/http-client.service";
import {IService} from "./IService";

@Injectable({
  providedIn: 'root'
})
export class ShipownersService implements IService {

  constructor(protected httpClient: HttpClientService) {
  }

  list() {
    return this.httpClient.get('/shipowner/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/shipowner/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/shipowner/get?id=' + id);
  }

  public update(shipowner: Shipowner) {
    return this.httpClient.put('/shipowner/update', shipowner);
  }

  public create(shipowner: Shipowner) {
    return this.httpClient.post('/shipowner/create', shipowner).pipe(
      map((data: any) => {
        console.log(data);
      }), catchError(res => observableThrowError(res)));
  }

  public remove(id: string | number) {
    return this.httpClient.delete('/shipowner/remove?id=' + id);
  }

  public findProducer(criteria: any) {
    return this.httpClient.post('/shipowner/findProducer', criteria);
  }

}
