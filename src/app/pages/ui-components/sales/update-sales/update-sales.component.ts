import {Component, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {ActivatedRoute, Router} from "@angular/router";
import {SaleService} from "../../../../services/sale.service";
import {SalesTransactionService} from "../../../../services/sales-transaction.service";
import {MatDialog} from "@angular/material/dialog";
import {GenericService} from "../../../../services/generic.service";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";
import {FilterDialogComponent} from "../../dialogs/filter-dialog/filter-dialog.component";
import {GridsStateService} from "../../../../services/grids-state.service";
import {forkJoin} from "rxjs";
import {ShipownersService} from "../../../../services/shipowner.service";
import {MerchantsService} from "../../../../services/merchant.service";
import 'lodash';
import {MatTableDataSource} from "@angular/material/table";
import {BoatService} from "../../../../services/boat.service";
import {SalePaymentService} from "../../../../services/sale-payment.service";

declare var _: any;

@Component({
  selector: 'app-update-sales',
  templateUrl: './update-sales.component.html',
  styleUrls: ['./update-sales.component.scss']
})
export class UpdateSalesComponent {

  public saleId: number;
  public sale: any = new Object();
  public commissionValues: Array<any> = [];
  public availableCommissions: Array<any> = [];
  public producerCommissions: Array<any> = [];
  public merchantCommissions: Array<any> = [];
  public boxesTypes: Array<any> = [];
  public selectedBoxesType: any = new Object();
  public totalProducerCommissions: number;
  public totalMerchantCommissions: number;
  public updateForm: FormGroup;
  public tab: any;
  routerUrl: string;
  selectedTabIndex: number = 0;
  dataSource = new MatTableDataSource<any>();
  totalPayments = 0;
  restTopay = 0;
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
              private saleService: SaleService,
              private shipownerService: ShipownersService,
              private merchantService: MerchantsService,
              private salesTransactionService: SalesTransactionService,
              private boatService: BoatService,
              private salePaymentService: SalePaymentService,
              private dialog: MatDialog,
              private router: Router,
              private gridsStateService: GridsStateService,
              private genericService: GenericService) {
    this.childrenToDisplay = [{
      entityName: 'salesTransaction',
      identifier: 'salesTransaction',
      routePrefix: "/ui-components/salesTransaction",
      label: 'Lignes de vente',
      method: 'find',
      displayedColumns: ['merchant', 'transactionNumber', 'article', 'boxes', 'grossWeight', 'subtractedWeight', 'netWeight', 'unitPrice', 'totalPrice', 'quittance', 'edit', 'delete'],
      service: this.salesTransactionService,
      defaultSort: {id: 'asc'}
    }, {
      entityName: 'salePayment',
      identifier: 'salePayment',
      routePrefix: "/ui-components/paymentSaleFromSale",
      label: 'Règlements pour Producteur',
      method: 'findWithDetails',
      displayedColumns: ['date', 'paymentName', 'payedValue', 'edit', 'delete'],
      service: this.salePaymentService,
      defaultSort: {id: 'asc'}
    }];
    this.route.params.subscribe(params => {
      this.saleId = params['id'];
      this.selectedTabIndex = params['tab'] || 0;
      this.initChildrenTabs();
    });
  }

  ngOnInit() {
    this.routerUrl = this.router.url;
    // const child = this.childrenToDisplay[this.selectedTabIndex];
    if (!this.gridsStateService.loadState(this.routerUrl, this)) {
      this.criteria[this.displayedChild.entityName].where = this.criteria[this.displayedChild.entityName].where || {};
      this.criteria[this.displayedChild.entityName].limit = this.pageSize;
      this.criteria[this.displayedChild.entityName].skip = 0;
      this.criteria[this.displayedChild.entityName].sort = {id: 'asc'};
    }
    this.updateForm = new FormGroup({
      dateFormControl: new FormControl('', Validators.required),
      producerFormControl: new FormControl('', Validators.required),
      boxesTypeFormControl: new FormControl('', Validators.required),
      boatFormControl: new FormControl(''),
      totalFormControl: new FormControl({value: '', disabled: true}),
      receiptNumberFormControl: new FormControl(''),
      totalToPayFormControl: new FormControl({value: '', disabled: true})
    });
    if (!this.saleId)
      this.sale.date = new Date();
    forkJoin(
      this.genericService.find('boxesType', {
        sort: {order: 'asc'}
      })
    ).subscribe(([response]: Array<any>) => {
      this.boxesTypes = response.data;
      this.find();
    });
  }

  public find() {
    // this.gridsStateService.saveState(this.router.url, this);
    if (this.saleId) {
      this.saleService.getSaleWithDetails(this.saleId).subscribe((response: any) => {
        this.sale = response.data.sale;
        this.commissionValues = response.data.commissionValues;
        this.availableCommissions = response.data.availableCommissions;
        this.populateCommissions();
        this.setSelectedBoxesType(null, this.sale.boxesTypeId);
        if (this.sale.shipOwner) {
          this.sale.shipOwner.isShipOwner = true;
          this.setSelectedProducer(this.sale.shipOwner);
        } else if (this.sale.merchant) {
          this.sale.merchant.isMerchant = true;
          this.setSelectedProducer(this.sale.merchant);
        }
        if (this.sale.boat)
          this.setSelectedBoat(this.sale.boat);
        this.switchChildTab(this.selectedTabIndex);
      });
    } else {
      const defaultBoxesType = _.find(this.boxesTypes, {default: true});
      if (defaultBoxesType)
        this.setSelectedBoxesType(null, defaultBoxesType.id);
    }
  }

  populateCommissions() {
    this.producerCommissions = _.filter(this.availableCommissions, function (commissionHistory: any) {
      return commissionHistory.isSellerCommission;
    });
    this.merchantCommissions = _.filter(this.availableCommissions, function (commissionHistory: any) {
      return commissionHistory.isCustomerCommission;
    });
    this.totalMerchantCommissions = 0;
    this.totalProducerCommissions = 0;
    for (let i in this.producerCommissions) {
      const commissionId = this.producerCommissions[i].commissionId;
      this.producerCommissions[i].saleCommissionValue = _.sumBy(this.commissionValues, function (commissionValue: any) {
        return commissionValue.commissionId == commissionId ? commissionValue.value : 0;
      });
      this.totalProducerCommissions += this.producerCommissions[i].saleCommissionValue;
    }
    for (let i in this.merchantCommissions) {
      const commissionId = this.merchantCommissions[i].commissionId;
      this.merchantCommissions[i].saleCommissionValue = _.sumBy(this.commissionValues, function (commissionValue: any) {
        return commissionValue.commissionId === commissionId ? commissionValue.value : 0;
      });
      this.totalMerchantCommissions += this.merchantCommissions[i].saleCommissionValue;
    }
  }

  public save() {
    let query;
    if (this.saleId)
      query = this.saleService.update(this.sale);
    else
      query = this.saleService.create(this.sale);
    query.subscribe((response: any) => {
      this.sale = response.data;
      this.saleId = this.sale.id;
    }, (response: any) => {
      var msg;
      msg = response.error.msg;
      if (response.error.error.errorCode == '#FOUND_RECEIPT_NUMBER_ERROR') {
        msg = 'Impossible de continuer. Une autre vente est déjà enregistrée avec le même numéro de bon de vente!';
      }
      if (msg)
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            message: msg,
            title: 'Attention!',
            confirm: () => {
              if (this.saleId) {
                this.find();
              }
            },
            hideReject: true
          }
        });
    });
  }

  public showFilterIcon(attr: string) {
    return this.lastFilterConfig[this.displayedChild.entityName][attr] || this.mouseOverHeader[this.displayedChild.entityName][attr];
  }

  public editChild(child: any) {
    this.router.navigate([this.displayedChild.routePrefix, "edit", child.id, this.saleId, this.selectedTabIndex]);
  }

  public addChild() {
    this.router.navigate([this.displayedChild.routePrefix, "add", this.saleId, this.selectedTabIndex]);
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
      this.find();
    }, (response: any) => {
      let msg = '!';
      msg = response.error.msg;
      if (response.error.error.error)
        msg = response.error.error.error;
      else if (response.error.error.errorCode === "#INTERNAL_ERROR")
        msg = 'Impossible le continuer! Une erreure interne est survenue.';
      else if (response.error.error.errorCode === "#ATTACHED_PAYMENTS" && this.displayedChild.identifier == 'salesTransaction')
        msg = 'Impossible le continuer! Des paiements sont attachés à la vente. Veuillez les supprimer en premier lieu!';
      if (msg)
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
      this.criteria[this.displayedChild.entityName].limit = this.pageEvent.pageSize;
      this.criteria[this.displayedChild.entityName].skip = this.pageEvent.pageIndex * this.pageEvent.pageSize
    } else {
      this.criteria[this.displayedChild.entityName].limit = this.pageSize;
      this.criteria[this.displayedChild.entityName].skip = 0;
    }
    this.findChildren();
  }

  public sortEvent($event: any) {
    if (!$event.active || $event.direction === '') {
      delete this.criteria[this.displayedChild.entityName].sort;
      return;
    }
    this.criteria[this.displayedChild.entityName].sort = {};
    this.criteria[this.displayedChild.entityName].sort[$event.active] = $event.direction;
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
    this.criteria[this.displayedChild.entityName].skip = 0;
  }

  public filterEvent(attr: string, type: string, entity: string | null = null, label: string | null = null) {
    this.dialog.open(FilterDialogComponent, {
      data: {
        name: attr,
        type: type,
        enumEntity: entity,
        enumLabel: label,
        lastConfig: this.lastFilterConfig[this.displayedChild.entityName][attr],
        criteria: this.criteria[this.displayedChild.entityName],
        filterEvent: (config: any) => {
          this.lastFilterConfig[this.displayedChild.entityName][attr] = config;
          this.resetPage();
          // this.findChildren();
        }
      }
    });
  }

  public initChildrenTabs() {
    this.displayedChild = this.childrenToDisplay[this.selectedTabIndex];
    for (let i in this.childrenToDisplay) {
      this.criteria[this.childrenToDisplay[i].entityName] = {};
      this.lastFilterConfig[this.childrenToDisplay[i].entityName] = {};
      this.mouseOverHeader[this.childrenToDisplay[i].entityName] = {};
      this.mouseOvered[this.childrenToDisplay[i].entityName] = {};
      if (this.childrenToDisplay[i].defaultSort)
        this.criteria[this.childrenToDisplay[i].entityName].sort = this.childrenToDisplay[i].defaultSort;
      this.criteria[this.childrenToDisplay[i].entityName].limit = this.pageSize;
      this.criteria[this.childrenToDisplay[i].entityName].skip = 0;
    }

  }

  public findChildren() {
    this.gridsStateService.saveState(this.routerUrl, this);
    let method = this.displayedChild.method || 'find';
    this.displayedChild.service[method](this.criteria[this.displayedChild.entityName]).subscribe((response: any) => {
      this.children[this.displayedChild.entityName] = response.data;
      this.dataSource = new MatTableDataSource(this.children[this.displayedChild.entityName]);
      this.length = response.metaData.count;
      this.totalPayments = _.sumBy(this.children[this.displayedChild.identifier], 'value');
      this.restTopay = this.sale.totalToPay - this.totalPayments;
    });
  }

  public switchChildTab(index: number) {
    this.selectedTabIndex = index;
    this.displayedChild = this.childrenToDisplay[index];
    this.criteria[this.displayedChild.entityName].where = {saleId: this.saleId};
    this.findChildren();
  }

  isValidForm() {
    return this.updateForm.valid;
  }

  public tappedProducerName: string;
  public selectedProducer: any;
  public producers: any;

  public searchProducers(event: any = null, id = null) {
    if (event && event.key === 'Enter')
      return;
    this.updateForm.controls['producerFormControl'].setErrors({noValue: true});
    let value = this.tappedProducerName;
    let criteria: any = {limit: 5, hideSpinner: true};
    if (id !== null) {
      criteria.where = {id: id};
    } else {
      criteria.where = {name: {'like': '%' + value + '%'}};
    }
    // forkJoin(
    //   this.shipownerService.find(criteria),
    //   this.merchantService.find(criteria)
    // ).subscribe(([response1, response2]: Array<any>) => {
    //   Object.keys(response1.data).forEach(e => {
    //     response1.data[e].isShipOwner = true;
    //   });
    //   Object.keys(response2.data).forEach(e => {
    //     response2.data[e].isMerchant = true;
    //   });
    //   this.producers = response1.data.concat(response2.data);
    //   this.producers.sort(function (producer1: any, producer2: any) {
    //     return producer1.name.localeCompare(producer2.name);
    //   });
    //   if (id !== null) {
    //     this.setSelectedProducer(response1.data[0] ? response1.data[0] : response2.data[0]);
    //   }
    // });
    this.shipownerService.findProducer(criteria).subscribe((response: any) => {
      this.producers = response.data;
      this.producers.sort(function (producer1: any, producer2: any) {
        return producer1.name.localeCompare(producer2.name);
      });
      if (id !== null) {
        this.setSelectedProducer(response.data[0]);
      }
    });
  }

  public setSelectedProducer(producer: any) {
    this.selectedProducer = producer;
    setTimeout(() => this.tappedProducerName = producer.lastName + ' ' + producer.firstName + (producer.isShipOwner ? ' (Armateur)' : ' (Commerçant)'));
    this.updateForm.controls['producerFormControl'].setErrors(null);
    if (producer.isMerchant) {
      this.sale.merchantId = producer.id;
      this.sale.shipOwnerId = null;
      this.clearBoatSelection();
    } else if (producer.isShipOwner) {
      this.sale.shipOwnerId = producer.id;
      this.sale.merchantId = null;
      if (producer.boats && producer.boats.length)
        this.setSelectedBoat(producer.boats[0]);
      else
        this.clearBoatSelection();
    }
    this.setProducerName();
  }

  public setProducerName() {
    if (this.sale)
      this.sale.producerName = this.selectedProducer ? (this.selectedProducer.lastName + ' ' + this.selectedProducer.firstName) : '';
  }

  clearBoatSelection() {
    this.tappedBoatName = '';
    this.selectedBoat = undefined;
    this.boats = [];
  }

  public tappedBoatName: string;
  public selectedBoat: any;
  public boats: any;

  public searchBoats(event: any = null, id = null) {
    if (event && event.key === 'Enter')
      return;
    this.updateForm.controls['boatFormControl'].setErrors({noValue: true});
    const splittedValue = this.tappedBoatName.split('|');
    let boatName = splittedValue[0] ? splittedValue[0].trim() : null;
    let boatSerialNumber = splittedValue[1] ? splittedValue[1].trim() : null;
    let criteria: any = {limit: 5, hideSpinner: true};
    if (id !== null) {
      criteria.where = {id: id};
    } else {
      criteria.where = {};
      if (boatName)
        criteria.where.name = {'like': '%' + boatName + '%'};
      if (boatSerialNumber)
        criteria.where.serialNumber = {'like': '%' + boatSerialNumber + '%'};
      if (this.sale.shipOwnerId)
        criteria.where.shipOwnerId = this.sale.shipOwnerId;
    }
    this.boatService.find(criteria).subscribe((response: any) => {
      if (!response.data.length)
        return;
      this.boats = response.data;
      this.boats.sort(function (a: any, b: any) {
        return a.name.localeCompare(b.name);
      });
      if (id !== null || response.data.length == 1) {
        this.setSelectedBoat(response.data[0]);
      }
      // this.updateForm.controls['boatFormControl'].setErrors(null);
    });
  }

  public setSelectedBoat(boat: any) {
    this.selectedBoat = boat;
    setTimeout(() => this.tappedBoatName = boat.name + (boat.serialNumber ? (' | ' + boat.serialNumber) : ''));
    this.updateForm.controls['boatFormControl'].setErrors(null);
    if (this.sale && this.selectedBoat) {
      this.sale.boatId = this.selectedBoat.id;
      this.sale.boatReference = this.selectedBoat.name;
      if (this.selectedBoat.serialNumber)
        this.sale.boatReference += ' | ' + this.selectedBoat.serialNumber;
    }
  }

  public setSelectedBoxesType(event: any, id = null) {
    if (id)
      this.selectedBoxesType = _.find(this.boxesTypes, {id: id});
    else
      this.selectedBoxesType = _.find(this.boxesTypes, {id: event.value});
    this.sale.boxesTypeId = this.selectedBoxesType.id;
  }

  public buildSaleTitle() {
    return this.sale.number.concat(' : ').concat(this.sale.producerName).concat(this.sale.boatReference ? '('.concat(this.sale.boatReference, ')') : '');
  }
}
