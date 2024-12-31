import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridsStateService {

  public gridState: any;

  constructor() {
    // @ts-ignore
    this.gridState = JSON.parse(sessionStorage.getItem('GridsState')) || {};
  }

  public saveState(route: string, component: any) {
    this.gridState[route] = {
      criteria: component.criteria,
      lastFilterConfig: component.lastFilterConfig,
      pageEvent: component.pageEvent
    }
    setTimeout(() => sessionStorage.setItem('GridsState', JSON.stringify(this.gridState)));
  }
  public loadState(route: string, component: any, forced: any = null) {
    if (!this.gridState[route])
      return false;
    component.criteria = this.gridState[route].criteria;
    if (forced) {
      for (let key in forced) {
        component.criteria[key] = forced[key];
      }
    }
    component.lastFilterConfig = this.gridState[route].lastFilterConfig;
    component.pageEvent = this.gridState[route].pageEvent || { pageSize: 10, pageIndex: 0 };
    if(component.paginator) {
      component.paginator.pageIndex = component.pageEvent.pageIndex;
      component.paginator.page.next(component.pageEvent);
    }
    component.pageSize = component.pageEvent.pageSize;
    return true;
  }
}
