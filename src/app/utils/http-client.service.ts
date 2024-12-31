import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Constants} from "../constants";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = Constants.API_URL;
  }

  public get(url:string) {
    url = this.apiUrl + url;
    return this.http.get(url);
  }

  public put(url:string, data: any) {
    url = this.apiUrl + url;
    return this.http.put(url, data);
  }

  public post(url:string, data: any) {
    url = this.apiUrl + url;
    return this.http.post(url, data);
  }

  public delete(url:string) {
    url = this.apiUrl + url;
    return this.http.delete(url);

  }
}
