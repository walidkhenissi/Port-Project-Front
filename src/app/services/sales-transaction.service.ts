import { Injectable } from '@angular/core';
import {IService} from "./IService";
import {HttpClientService} from "../utils/http-client.service";

@Injectable({
  providedIn: 'root'
})
export class SalesTransactionService implements IService {

  constructor(protected httpClient: HttpClientService) {

  }

  list() {
    return this.httpClient.get('/salesTransaction/list');
  }

  public find(criteria: any) {
    return this.httpClient.post('/salesTransaction/find', criteria);
  }

  public getOne(id: string | number) {
    return this.httpClient.get('/salesTransaction/get?id=' + id);
  }

  public update(salesTransaction: any) {
    return this.httpClient.put('/salesTransaction/update', salesTransaction);
  }

  create(salesTransaction: any) {
    return this.httpClient.post('/salesTransaction/create', salesTransaction);
  }

  remove(id: string | number) {
    return this.httpClient.delete('/salesTransaction/remove?id=' + id);
  }
  // Fonction pour récupérer les transactions
 suivi(){
    return this.httpClient.get('/salesTransaction/filter');
  }
  public generateSalesTransactionReport(options: any) {
    return this.httpClient.post('/salesTransaction/generateSalestransactionReport', options);
  }


//   public filter(criteria: any) {
//     const dateQuery = criteria.operator && criteria.date
//     ? `date${criteria.operator === 'greaterThan' ? '>=' :
//         criteria.operator === 'lowerThan' ? '<=' :
//         criteria.operator === 'notEquals' ? '!=' : '='}${criteria.date}`
//     : criteria.date ? `date=${criteria.date}`
//     : null;
//
//     const queryParams = [
//       criteria.date && !criteria.date2 && criteria.operator === 'equals'
//             ? `date=${criteria.date}` : null,
//         criteria.date && criteria.operator === 'greaterThan'
//             ? `startDate=${criteria.date}` : null,
//         criteria.date && criteria.operator === 'lowerThan'
//             ? `endDate=${criteria.date}` : null,
//         criteria.date && criteria.date2
//             ? `startDate=${criteria.date}&endDate=${criteria.date2}` : null,
//
//         // criteria.date && !criteria.date2   ? dateQuery : null,
//         // criteria.date && criteria.date2 ? `startDate=${criteria.date}` : null,
//         // criteria.date2 ? `endDate=${criteria.date2}` : null,
//         criteria.producerName ? `producerName=${criteria.producerName}` : null,
//         criteria.articleName ? `articleName=${criteria.articleName}` : null,
//         criteria.merchantName ? `merchantName=${criteria.merchantName}` : null,
//         criteria.format ? `format=${criteria.format}`: null
//     ]
//     .filter(param => param !== null) // Remove null values
//     .join('&'); // Join with '&' to form query string
//     console.log('queryParams:', queryParams);
//     console.log("the criteria data is",criteria)
//     console.log('URL complète:', `/salesTransaction/filter?${queryParams}`);
//     // Construct and return the GET request
//     //return this.httpClient.get(`/salesTransaction/filter?${queryParams}`);
//     return this.httpClient.post('http://localhost:3000/salesTransaction/filter',queryParams);
// }

}
