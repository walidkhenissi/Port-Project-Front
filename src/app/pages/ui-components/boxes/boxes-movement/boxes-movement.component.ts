import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {BoxesBalanceService} from "../../../../services/boxes-balance.service";
import {ShipownersService} from "../../../../services/shipowner.service";
import {MerchantsService} from "../../../../services/merchant.service";
import {BoxesTransactionService} from "../../../../services/boxes-transaction.service";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../../services/grids-state.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FilterDialogComponent} from "../../dialogs/filter-dialog/filter-dialog.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-boxes-movement',
  templateUrl: './boxes-movement.component.html',
  styleUrls: ['./boxes-movement.component.scss']
})
export class BoxesMovementComponent {

  boxesBalanceId: number;
  boxesBalance: any = new Object();
  isShipOwnerCase: boolean = false;
  isMerchantCase: boolean = false;
  public updateForm: FormGroup;
  previousSelectedTabIndex: number = 0;
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
              private boxesBalanceService: BoxesBalanceService,
              private shipownerService: ShipownersService,
              private merchantService: MerchantsService,
              private boxesTransactionService: BoxesTransactionService,
              private dialog: MatDialog,
              private router: Router,
              private gridsStateService: GridsStateService) {
    this.childrenToDisplay = [{
      identifier: 'boxesTransaction',
      entityName: 'boxesTransaction',
      routePrefix: "/ui-components/boxesTransaction",
      label: 'Mouvement',
      service: this.boxesTransactionService,
      // defaultFilter: {merchantId: null},
      defaultSort: {date: 'desc'},
      displayedColumns: ['date', 'debit', 'credit', 'balance', 'edit', 'delete']
    }];
    this.route.params.subscribe(params => {
      this.boxesBalanceId = params['id'];
      this.previousSelectedTabIndex = params['tab'] || params['prevTab1'] || 0;
      this.selectedTabIndex = params['prevTab2'] || 0;
      this.initChildrenTabs();
    });
  }

  ngOnInit() {
    if (!this.gridsStateService.loadState(this.router.url + '/' + this.selectedTabIndex, this)) {
      this.criteria[this.displayedChild.identifier].where = this.criteria[this.displayedChild.identifier].where || {};
      this.criteria[this.displayedChild.identifier].limit = this.pageSize;
      this.criteria[this.displayedChild.identifier].skip = 0;
      this.criteria[this.displayedChild.identifier].sort = {date: 'desc'};
    }
    this.updateForm = new FormGroup({
      debitFormControl: new FormControl({value: '', disabled: true}),
      creditFormControl: new FormControl({value: '', disabled: true}),
      balanceFormControl: new FormControl({value: '', disabled: true})
    });
    if (this.boxesBalanceId) {
      this.boxesBalanceService.getOne(this.boxesBalanceId).subscribe((response: any) => {
        this.boxesBalance = response.data;
        if (this.boxesBalance.shipOwnerId) {
          this.isShipOwnerCase = true;
          this.displayedChild.displayedColumns = ['date', 'debit', 'credit', 'balance', 'edit', 'delete'];
        } else if (this.boxesBalance.merchantId) {
          this.isMerchantCase = true;
          this.displayedChild.displayedColumns = ['date', 'debit', 'credit', 'merchantSalesCredit', 'balance', 'edit', 'delete'];
        }
        this.switchChildTab(this.selectedTabIndex);
      });
    }
  }

  public showFilterIcon(attr: string) {
    return this.lastFilterConfig[this.displayedChild.identifier][attr] || this.mouseOverHeader[this.displayedChild.identifier][attr];
  }

  public editChild(child: any) {
    this.router.navigate([this.displayedChild.routePrefix, "edit", child.id, this.boxesBalanceId, this.previousSelectedTabIndex, this.selectedTabIndex]);
  }

  public addChild() {
    this.router.navigate([this.displayedChild.routePrefix, "add", this.boxesBalanceId, this.previousSelectedTabIndex, this.selectedTabIndex]);
  }


  public removeChild(child: any, confirm: boolean) {
    if (child.merchantId && child.debit)
      return;
    else if (child.shipOwnerId && child.credit)
      return;
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
    if (this.isShipOwnerCase) {
      delete this.criteria[this.displayedChild.identifier].where.merchantId;
      this.criteria[this.displayedChild.identifier].where.shipOwnerId = this.boxesBalance.shipOwnerId;
    } else if (this.isMerchantCase) {
      delete this.criteria[this.displayedChild.identifier].where.shipOwnerId;
      this.criteria[this.displayedChild.identifier].where.merchantId = this.boxesBalance.merchantId;
    }
    this.displayedChild.service.find(this.criteria[this.displayedChild.identifier]).subscribe((response: any) => {
      this.children[this.displayedChild.identifier] = response.data;
      this.dataSource = new MatTableDataSource(this.children[this.displayedChild.identifier]);
      this.length = response.metaData.count;
    });
  }

  toogleTitle() {
    let title = 'Mouvement des caisses';
    if (!this.boxesBalance)
      return title;
    if (this.isShipOwnerCase)
      title = title.concat(' de l\'armateur : ').concat(this.boxesBalance.shipOwner.name);
    else if (this.isMerchantCase)
      title = title.concat(' du commerçant : ').concat(this.boxesBalance.merchant.name);
    return title;
  }

  isProssibleRemove(child: any) {
    if (this.isShipOwnerCase)
      return !child.credit;
    if (this.isMerchantCase)
      return !child.debit;
    return false;
  }
}
