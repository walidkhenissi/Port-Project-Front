import {Component, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {ActivatedRoute, Router} from "@angular/router";
import {BeneficiaryBalanceService} from "../../../../services/beneficiary-balance.service";
import {ShipownersService} from "../../../../services/shipowner.service";
import {MerchantsService} from "../../../../services/merchant.service";
import {SalesTransactionService} from "../../../../services/sales-transaction.service";
import {BalanceService} from "../../../../services/balance.service";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../../services/grids-state.service";
import {GenericService} from "../../../../services/generic.service";
import {BoxesBalanceService} from "../../../../services/boxes-balance.service";
import {BoxesTransactionService} from "../../../../services/boxes-transaction.service";
import {FilterDialogComponent} from "../../dialogs/filter-dialog/filter-dialog.component";

@Component({
  selector: 'app-boxes',
  templateUrl: './boxes.component.html',
  styleUrls: ['./boxes.component.scss']
})
export class BoxesComponent {

  selectedTabIndex: number = 0;
  dataSource = new MatTableDataSource<any>();
  //children
  public childrenToDisplay: any;
  public displayedChild: any;
  public criteria: any = {}
  public children: any = {}
  public lastFilterConfig: any = {};
  public mouseOvered: any = new Object();
  public mouseOverHeader: any = new Object();
  public length: number = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100, 200, 500, 1000];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // MatPaginator Output
  public pageEvent: PageEvent;

  constructor(private route: ActivatedRoute,
              private boxesBalanceService: BoxesBalanceService,
              private shipownerService: ShipownersService,
              private merchantService: MerchantsService,
              private boxesTransactionService: BoxesTransactionService,
              private dialog: MatDialog,
              private router: Router,
              private gridsStateService: GridsStateService) {
    this.childrenToDisplay = [{
      identifier: 'shipOwnerBalance',
      entityName: 'boxesTransaction',
      routePrefix: "/ui-components/boxes",
      label: 'Balance des Caisses vides des armateurs',
      service: this.boxesBalanceService,
      defaultFilter: {merchantId: null, shipOwnerId: {'!': null}},
      defaultSort: {balance: 'desc'},
      displayedColumns: ['shipOwner', 'debit', 'credit', 'balance', 'edit']
    }, {
      identifier: 'merchantBalance',
      entityName: 'boxesBalance',
      routePrefix: "/ui-components/boxes",
      label: 'Balance des Caisses vides des commerçants',
      service: this.boxesBalanceService,
      defaultFilter: {shipOwnerId: null, merchantId: {'!': null}},
      defaultSort: {balance: 'asc'},
      displayedColumns: ['merchant', 'debit', 'credit', 'balance', 'edit']
    }, {
      identifier: 'transactions',
      entityName: 'boxesTransaction',
      routePrefix: "/ui-components/boxes",
      label: 'Stock des caisses',
      service: this.boxesTransactionService,
      defaultFilter: {isCommissionaryTransaction: true},
      defaultSort: {date: 'desc'},
      displayedColumns: ['date', 'name', 'debit', 'credit', 'stock']
    }];
    this.route.params.subscribe(params => {
      this.selectedTabIndex = params['tab'] || 0;
      this.initChildrenTabs();
    });
  }

  ngOnInit() {
    if (!this.gridsStateService.loadState(this.router.url + '/' + this.selectedTabIndex, this)) {
      this.criteria[this.displayedChild.identifier].where = this.criteria[this.displayedChild.identifier].where || {};
      this.criteria[this.displayedChild.identifier].limit = this.pageSize;
      this.criteria[this.displayedChild.identifier].skip = 0;
      this.criteria[this.displayedChild.identifier].sort = {id: 'asc'};
    }
    this.findChildren();
  }

  public showFilterIcon(attr: string) {
    return this.lastFilterConfig[this.displayedChild.identifier][attr] || this.mouseOverHeader[this.displayedChild.identifier][attr];
  }

  public editChild(child: any) {
    this.router.navigate([this.displayedChild.routePrefix, "edit", child.id, this.selectedTabIndex]);
  }

  public paginationEvent($event: PageEvent) {
    this.pageEvent = $event;
    if (this.pageEvent) {
      this.criteria[this.displayedChild.identifier].limit = this.pageEvent.pageSize;
      this.criteria[this.displayedChild.identifier].skip = this.pageEvent.pageIndex * this.pageEvent.pageSize
    } else {
      this.criteria[this.displayedChild.identifier].limit = this.pageSize;
      this.criteria[this.displayedChild.identifier].skip = 0;
    }
    this.findChildren();
  }

  public sortEvent($event: any) {
    if (!$event.active || $event.direction === '') {
      delete this.criteria[this.displayedChild.identifier].sort;
      return;
    }
    this.criteria[this.displayedChild.identifier].sort = {};
    this.criteria[this.displayedChild.identifier].sort[$event.active] = $event.direction;
    this.resetPage();
    this.findChildren();
  }

  public resetPage() {
    this.paginator.pageIndex = 0;
    this.paginator.page.next({
      pageIndex: 0,
      pageSize: this.paginator.pageSize,
      length: this.paginator.length
    });
    this.criteria[this.displayedChild.identifier].skip = 0;
  }

  public filterEvent(attr: string, type: string, entity: string | null = null, label: string | null = null) {
    this.dialog.open(FilterDialogComponent, {
      data: {
        name: attr,
        type: type,
        enumEntity: entity,
        enumLabel: label,
        lastConfig: this.lastFilterConfig[this.displayedChild.identifier][attr],
        criteria: this.criteria[this.displayedChild.identifier],
        filterEvent: (config: any) => {
          this.lastFilterConfig[this.displayedChild.identifier][attr] = config;
          this.resetPage();
          // this.findChildren();
        }
      }
    });
  }

  public initChildrenTabs() {
    this.displayedChild = this.childrenToDisplay[this.selectedTabIndex];
    for (let i in this.childrenToDisplay) {
      this.criteria[this.childrenToDisplay[i].identifier] = {};
      this.lastFilterConfig[this.childrenToDisplay[i].identifier] = {};
      this.mouseOverHeader[this.childrenToDisplay[i].identifier] = {};
      this.mouseOvered[this.childrenToDisplay[i].identifier] = {};
      if (this.childrenToDisplay[i].defaultSort)
        this.criteria[this.childrenToDisplay[i].identifier].sort = this.childrenToDisplay[i].defaultSort;
      this.criteria[this.childrenToDisplay[i].identifier].where = {};
      if (this.childrenToDisplay[i].defaultFilter)
        this.criteria[this.childrenToDisplay[i].identifier].where = this.childrenToDisplay[i].defaultFilter;
      this.criteria[this.childrenToDisplay[i].identifier].limit = this.pageSize;
      this.criteria[this.childrenToDisplay[i].identifier].skip = 0;
    }
  }

  public switchChildTab(index: number) {
    this.selectedTabIndex = index;
    this.displayedChild = this.childrenToDisplay[index];
    this.findChildren();
  }

  public findChildren() {
    this.gridsStateService.saveState(this.router.url + '/' + this.selectedTabIndex, this);
    this.displayedChild.service.find(this.criteria[this.displayedChild.identifier]).subscribe((response: any) => {
      this.children[this.displayedChild.identifier] = response.data;
      this.dataSource = new MatTableDataSource(this.children[this.displayedChild.identifier]);
      this.length = response.metaData.count;
    });
  }

}
