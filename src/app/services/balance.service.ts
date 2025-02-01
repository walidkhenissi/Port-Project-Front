import { Injectable } from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";
import {Constants} from "../constants";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class BalanceService implements IService {

  constructor(protected httpClient: HttpClientService,
              protected httpC :HttpClient) {

  }

  list() {
    return this.httpClient.get('/balance/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/balance/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/balance/get?id=' + id);
  }

  public update(balance: any) {
    return this.httpClient.put('/balance/update', balance);
  }

  create(balance: any) {
    return this.httpClient.post('/balance/create', balance);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/balance/remove?id=' + id);
  }
  public generateReportSoldeProducteur(options: any) {
    return this.httpC.post(`${Constants.API_URL}/balance/generateReportSoldeProducteur`, options,{ withCredentials: true });
  }
  public generateReportSoldeCommercant(options: any) {
    return this.httpC.post(`${Constants.API_URL}/balance/generateReportSoldeCommercant`, options,{ withCredentials: true });
  }
}
