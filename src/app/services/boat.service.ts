import {HttpErrorResponse} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {BoatActivityType} from "../models/boat.activity.type";
import {catchError, map} from 'rxjs/operators';
import {Observable, throwError as observableThrowError, throwError} from 'rxjs';
import {Ship} from "../models/ship";
import {HttpClientService} from '../utils/http-client.service';
import {IService} from "./IService";

@Injectable({
  providedIn: 'root'
})
export class BoatService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/boat/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/boat/find', criteria, {withCredentials: true});
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/boat/get?id=' + id);
  }

  public update(ship: Ship) {
    return this.httpClient.put('/boat/update', ship);
  }

  addBoatActivityType(boatActivityType: BoatActivityType) {
    return this.httpClient.post('/boatActivity/create', boatActivityType, {withCredentials: true}).pipe(
      map((data: any) => {
        console.log(data)
      }), catchError(res => observableThrowError(res)));
  }

  getAllBoatActivityType(criteria: any): Observable<any> {
    return this.httpClient.post('/boatActivity/find', criteria, {withCredentials: true});
  }

  getAllBoatActivityTypes(): Observable<any> {
    return this.httpClient.get(`/boatActivity/list`).pipe(
      map(
        data => data,
        catchError((err: HttpErrorResponse) => throwError(err))
      ));
  }

  deleteBoatActivityType(id: number): Observable<any> {
    return this.httpClient.delete('/boatActivity/remove?id=' + id);
  }

  create(ship: Ship) {
    return this.httpClient.post('/boat/create', ship, {withCredentials: true}).pipe(
      map((data: any) => {
        console.log(data)
      }), catchError(res => observableThrowError(res)));
  }

  // getAllShips(pageNumber: Number,
  //     pageSize: Number): Observable<any> {
  //     return this.httpClient.get(`/get-all-boats?page=${pageNumber}&pageSize=${pageSize}`).pipe(
  //         map(
  //             data => data,
  //             catchError((err: HttpErrorResponse) => throwError(err))
  //         ));
  // }

  remove(id: string | number) {
    return this.httpClient.delete('/boat/remove?id=' + id);
  }

  // getShip(shipId: number): Observable<any> {
  //     const url = `/boat/${shipId}`;
  //     return this.httpClient.get(url);
  // }

  // update(shipId: number, updatedShip: any): Observable<any> {
  //     const url = `/update-boat/${shipId}`;
  //     return this.httpClient.put(url, updatedShip);
  // }
}
