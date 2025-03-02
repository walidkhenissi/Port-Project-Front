import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";
import {catchError, map} from "rxjs/operators";
import {throwError as observableThrowError} from "rxjs";
import {BoatActivityType} from "../models/boat.activity.type";

@Injectable({
  providedIn: 'root'
})
export class BoatActivityTypeService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/boatActivity/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/boatActivity/find', criteria, {withCredentials: true});
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/boatActivity/get?id=' + id);
  }

  public update(boatActivityType: BoatActivityType) {
    return this.httpClient.put('/boatActivity/update', boatActivityType);
  }

  create(boatActivityType: BoatActivityType) {
    return this.httpClient.post('/boatActivity/create', boatActivityType, {withCredentials: true}).pipe(
      map((data: any) => {
        console.log(data)
      }), catchError(res => observableThrowError(res)));
  }

  remove(id: string | number) {
    return this.httpClient.delete('/boatActivity/remove?id=' + id);
  }
}
