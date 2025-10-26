import {Injectable} from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class BoxesBalanceService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/boxesBalance/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/boxesBalance/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/boxesBalance/get?id=' + id);
  }

  public update(balance: any) {
    return this.httpClient.put('/boxesBalance/update', balance);
  }

  create(balance: any) {
    return this.httpClient.post('/boxesBalance/create', balance);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/boxesBalance/remove?id=' + id);
  }

  public generateReportShipOwner(options: any) {
    return this.httpClient.post('/boxesBalance/generateReportShipOwner', options);
  }

  public generateReportMerchant(options: any) {
    return this.httpClient.post('/boxesBalance/generateReportMerchant', options);
  }

  public generateSummaryReportMerchant() {
    return this.httpClient.get('/boxesBalance/generateSummaryReportMerchant');
  }

  public generateSummaryReportShipOwner() {
    return this.httpClient.get('/boxesBalance/generateSummaryReportShipOwner');
  }

}
