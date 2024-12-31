import {Component, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {ActivatedRoute, Router} from "@angular/router";
import {ShipownersService} from "../../../services/shipowner.service";
import {MerchantsService} from "../../../services/merchant.service";
import {SalesTransactionService} from "../../../services/sales-transaction.service";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../services/grids-state.service";
import {GenericService} from "../../../services/generic.service";
import {BalanceService} from "../../../services/balance.service";
import {BeneficiaryBalanceService} from "../../../services/beneficiary-balance.service";
import {ConfirmDialogComponent} from "../dialogs/confirm-dialog/confirm-dialog.component";
import {FilterDialogComponent} from "../dialogs/filter-dialog/filter-dialog.component";

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent {

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
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // MatPaginator Output
  public pageEvent: PageEvent;

  constructor(private route: ActivatedRoute,
              private beneficiaryBalanceService: BeneficiaryBalanceService,
              private shipownerService: ShipownersService,
              private merchantService: MerchantsService,
              private salesTransactionService: SalesTransactionService,
              private balanceService: BalanceService,
              private dialog: MatDialog,
              private router: Router,
              private gridsStateService: GridsStateService,
              private genericService: GenericService) {
    this.childrenToDisplay = [{
      identifier: 'shipOwnerBalance',
      entityName: 'balance',
      routePrefix: "/ui-components/balance",
      label: 'Balance des Armateurs',
      service: this.balanceService,
      defaultFilter: {merchantId: null},
      defaultSort: {balance: 'desc'},
      displayedColumns: ['shipOwner', 'balance']
    }, {
      identifier: 'merchantBalance',
      entityName: 'balance',
      routePrefix: "/ui-components/balance",
      label: 'Balance des Commerçants',
      service: this.balanceService,
      defaultFilter: {shipOwnerId: null},
      defaultSort: {balance: 'desc'},
      displayedColumns: ['merchant', 'balance']
    }, {
      identifier: 'beneficiaryBalance',
      entityName: 'beneficiaryBalance',
      routePrefix: "/ui-components/balance",
      label: 'Balance des Bénéficiaires des commissions',
      service: this.beneficiaryBalanceService,
      defaultSort: {balance: 'desc'},
      displayedColumns: ['beneficiary', 'balance', 'details']
    }];
    this.route.params.subscribe(params => {
      this.selectedTabIndex = params['tab'] || 0;
      this.initChildrenTabs();
    });
  }

  ngOnInit() {
    if (!this.gridsStateService.loadState(this.router.url + '/' + this.selectedTabIndex, this)) {
      // if (!this.gridsStateService.loadState(this.router.url, this)) {
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

  public addChild() {
    this.router.navigate([this.displayedChild.routePrefix, "add", this.selectedTabIndex]);
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

  public removeChild(child: any, confirm: boolean) {
    if (confirm === false) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: 'Etes-vous sûr de vouloir supprimer cet élément : ' + this.displayedChild.label + ' ?',
          title: 'Attention!',
          confirm: () => this.removeChild(child, true),
          reject: () => {
          }
        }
      });
      return;
    }
    this.displayedChild.service.remove(child.id).subscribe((response: any) => {
      this.findChildren();
    }, (response: any) => {
      let msg;
      msg = "Une erreur inattendue est survenue!";
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: msg,
          title: 'Attention!',
          confirm: () => {
            this.findChildren();
          },
          hideReject: true
        },
        width: '450px'
      });
    });
  }

  goToDetails(element: any) {
    this.router.navigate(["/ui-components/balanceDetails/", element.beneficiary.id]);
  }
}
