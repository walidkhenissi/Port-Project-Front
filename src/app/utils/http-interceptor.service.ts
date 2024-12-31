import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpResponse, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse} from '@angular/common/http'
import {Router} from '@angular/router';
// import 'rxjs/add/operator/do';
import  * as $ from 'jquery';
import {Observable, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {


  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const credentialsReq = req.clone({withCredentials: true, setHeaders: {"X-XSRF-TOKEN": "MY-TOKEN"}});
    if (req.body && !req.body.hideSpinner)
      $('#spinner').show();
    if (req.body)
      delete req.body.hideSpinner;
    return next.handle(req).pipe(
      tap(
        event => this.handleResponse(req, event),
        error => this.handleError(req, error)
      )
    );
    // return next.handle(credentialsReq).pipe(event => {
    //   if (event instanceof HttpResponse) {
    //     if (req.body && !req.body.hideSpinner)
    //       $('#spinner').hide();
    //   }
    // }, err => {
    //   $('#spinner').hide();
    //   if (err instanceof HttpErrorResponse && err.status == 401) {
    //     $('#spinner').hide();
    //     this.router.navigate(["login"]);
    //   }
    // });
  }

  handleResponse(req: HttpRequest<any>, event:any) {
    if (event instanceof HttpResponse) {
      if (req.body && !req.body.hideSpinner)
        $('#spinner').hide();
    }
  }

  handleError(req: HttpRequest<any>, err:any) {
    $('#spinner').hide();
    if (err instanceof HttpErrorResponse && err.status == 401) {
      $('#spinner').hide();
      this.router.navigate(["login"]);
    }
  }
}
