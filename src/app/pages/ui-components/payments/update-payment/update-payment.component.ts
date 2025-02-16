import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {ActivatedRoute, Router} from "@angular/router";
import {BoxesBalanceService} from "../../../../services/boxes-balance.service";
import {ShipownersService} from "../../../../services/shipowner.service";
import {MerchantsService} from "../../../../services/merchant.service";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../../services/grids-state.service";
import {PaymentService} from "../../../../services/payment.service";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";
import {FilterDialogComponent} from "../../dialogs/filter-dialog/filter-dialog.component";
import {forkJoin} from "rxjs";
import {BalanceService} from "../../../../services/balance.service";
import {GenericService} from "../../../../services/generic.service";
import 'lodash';
import * as moment from 'moment';
import {SalesTransactionPaymentService} from "../../../../services/sales-transaction-payment.service";
import {SalePaymentService} from "../../../../services/sale-payment.service";

declare var _: any;

@Component({
  selector: 'app-update-payment',
  templateUrl: './update-payment.component.html',
  styleUrls: ['./update-payment.component.scss']
})
export class UpdatePaymentComponent {

  paymentId: number;
  payment: any = new Object();
  oldPayment: any = new Object();
  balance: any = new Object();
  selectedMerchant: any = new Object();
  tappedMerchantName: string;
  paymentTypes: any = [];
  consumptionInfos: any = [];
  banks: any = [];
  merchantList: any = [];
  provisionalBalance = 0;
  isCheckType = false;
  isPromissoryType = false;
  public updateForm: FormGroup;
  selectedTabIndex: number = 0;
  dataSource = new MatTableDataSource<any>();
  context = -1;
  title = 'Paiement';
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
              private paymentService: PaymentService,
              private balanceService: BalanceService,
              private salesTransactionPaymentService: SalesTransactionPaymentService,
              private salePaymentService: SalePaymentService,
              private genericService: GenericService,
              private cd: ChangeDetectorRef,
              private dialog: MatDialog,
              private router: Router,
              private gridsStateService: GridsStateService) {
    this.childrenToDisplay = [{
      identifier: 'salesTransactionPayment',
      entityName: 'salesTransaction_Payment',
      routePrefix: "/ui-components/paymentSalesTransaction",
      label: 'Règlements Achats',
      method: 'findWithDetails',
      service: this.salesTransactionPaymentService,
      // defaultFilter: {paymentTypeId: this.paymentId},
      defaultSort: {date: 'desc'},
      displayedColumns: ['date', 'value', 'transactionNumber', 'paymentType', 'edit', 'delete']
    },
      {
        identifier: 'salePayment',
        entityName: 'salePayment',
        routePrefix: "/ui-components/paymentSale",
        label: 'Règlements Ventes',
        method: 'findWithDetails',
        service: this.salePaymentService,
        // defaultFilter: {paymentTypeId: this.paymentId},
        defaultSort: {date: 'desc'},
        displayedColumns: ['date', 'producerName', 'boatReference', 'saleNumber', 'saleValue', 'payedValue', 'edit', 'delete']
      }];
    this.route.params.subscribe(params => {
      this.paymentId = params['id'];
      this.context = params['context'] || 0;
      this.selectedTabIndex = this.context == 2 ? 0 : 1;
      this.initChildrenTabs();
    });
  }

  ngOnInit() {
    if (!this.gridsStateService.loadState(this.router.url, this)) {
      this.criteria[this.displayedChild.identifier].where = this.criteria[this.displayedChild.identifier].where || {};
      this.criteria[this.displayedChild.identifier].limit = this.pageSize;
      this.criteria[this.displayedChild.identifier].skip = 0;
      this.criteria[this.displayedChild.identifier].sort = {date: 'desc'};
    }
    this.updateForm = new FormGroup({
      nameFormControl: new FormControl({value: '', disabled: true}),
      balanceFormControl: new FormControl({value: '', disabled: true}),
      tempBalanceFormControl: new FormControl({value: '', disabled: true}),
      dateFormControl: new FormControl(''),
      merchantFormControl: new FormControl(''),
      valueFormControl: new FormControl(''),
      consumedFormControl: new FormControl({value: '', disabled: true}),
      restFormControl: new FormControl({value: '', disabled: true}),
      typeFormControl: new FormControl(''),
      consumptionInfoFormControl: new FormControl({value: '', disabled: true}),
      numberFormControl: new FormControl(''),
      bankFormControl: new FormControl(''),
      dueDateFormControl: new FormControl(''),
      signatoryFormControl: new FormControl(''),
      noteFormControl: new FormControl('')
    });
    if (!this.paymentId) {
      if (this.context == 1)
        this.title = 'Ajouter un paiement du commissionaire';
      else if (this.context == 2)
        this.title = 'Ajouter un paiement du commerçant';
    }
    if (this.paymentId) {
      forkJoin(
        this.paymentService.getOne(this.paymentId),
        this.genericService.find('paymentType', {
          where: this.context == 1 ? {commissionnaryPayment: true} : {merchantPayment: true},
          sort: {order: 'asc'}
        }),
        this.genericService.find('consumptionInfo', {sort: {name: 'asc'}}),
        this.genericService.find('bank', {sort: {name: 'asc'}}),
      ).subscribe(([response1, response2, response3, response4]: Array<any>) => {
        this.payment = response1.data;
        if (this.payment.isStartBalance) {
          this.disableAll();
        }
        this.loadBalance(this.payment.merchantId);
        this.searchMerchants(null, this.payment.merchantId);
        this.paymentTypes = response2.data;
        this.consumptionInfos = response3.data;
        this.banks = response4.data;
        this.oldPayment = JSON.parse(JSON.stringify(response1.data));
        this.selectedMerchant = this.payment.merchant
        this.buildTitle();
        this.checkPaymentType();
        this.switchChildTab(this.payment.isCommissionnaryPayment ? 1 : 0);
      });
    } else {
      forkJoin(
        this.genericService.find('paymentType', {
          where: this.context == 1 ? {commissionnaryPayment: true} : {merchantPayment: true},
          sort: {order: 'asc'}
        }),
        this.genericService.find('consumptionInfo', {sort: {name: 'asc'}}),
        this.genericService.find('bank', {sort: {name: 'asc'}}),
      ).subscribe(([response1, response2, response3]: Array<any>) => {
        this.paymentTypes = response1.data;
        this.consumptionInfos = response2.data;
        this.banks = response3.data;
        this.payment.date = new Date();
        this.payment.rest = 0;
        this.payment.consumed = 0;
        // this.switchChildTab(this.selectedTabIndex);
      });
      if (this.context == 1) {
        this.payment.isCommissionnaryPayment = true;
        this.generateLabel();
      }
    }
  }

  public disableAll() {
    for (let control in this.updateForm.controls)
      if (!this.updateForm.controls[control].disabled)
        this.updateForm.controls[control].disable();
  }

  checkPaymentType() {
    let chequeType = _.find(this.paymentTypes, {reference: 'CHEQUE'});
    let promissoryType = _.find(this.paymentTypes, {reference: 'PROMISSORY'});
    if (this.payment && this.payment.paymentTypeId == chequeType.id)
      this.isCheckType = true;
    if (this.payment && this.payment.paymentTypeId == promissoryType.id)
      this.isPromissoryType = true;
  }

  buildTitle() {
    this.title = 'Paiement : ' + this.payment.name;
  }

  public showFilterIcon(attr: string) {
    return this.lastFilterConfig[this.displayedChild.identifier][attr] || this.mouseOverHeader[this.displayedChild.identifier][attr];
  }

  public editChild(child: any) {
    this.router.navigate([this.displayedChild.routePrefix, "edit", child.id, this.context, this.selectedTabIndex]);
  }

  public addChild() {
    this.router.navigate([this.displayedChild.routePrefix, "add", this.paymentId, this.context, this.selectedTabIndex]);
  }

  public goBack() {
    if (this.context == 1)
      this.router.navigate(['/ui-components/commissionaryPayment']);
    else if (this.context == 2)
      this.router.navigate(['/ui-components/merchantPayment']);
    else if (this.context == 3)
      this.router.navigate(['/ui-components/producerPayment']);
  }

  public save() {
    let query;
    if (this.paymentId)
      query = this.paymentService.update(this.payment);
    else
      query = this.paymentService.create(this.payment);
    query.subscribe((response: any) => {
      this.payment = response.data;
      if (this.context == 2)
        this.loadBalance(this.payment.merchantId);
      this.buildTitle();
      this.paymentId = this.payment.id;
    }, (response: any) => {
      let msg = '!';
      msg = response.error.msg;
      if (response.error.error.error)
        msg = response.error.error.error;
      if (response.error.error.errorCode === "#INTERNAL_ERROR")
        msg = 'Impossible le continuer! Une erreure interne est survenue.';
      if (response.error.error.errorCode === "#EXCEED_PAYMENT_VALUE")
        msg = 'Impossible le continuer! La somme des paiements dépasse le montant du règlement!';
      if (msg)
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            message: msg,
            title: 'Attention!',
            confirm: () => {
              if (this.paymentId) {
                this.findChildren();
              }
            },
            hideReject: true
          }
        });
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
      this.paymentService.getOne(this.paymentId).subscribe((response: any) => {
        this.payment = response.data;
        this.findChildren()
      })
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
    this.displayedChild = this.childrenToDisplay[(this.payment && this.payment.isCommissionnaryPayment) ? 1 : 0];
    this.findChildren();
  }

  public findChildren() {
    this.gridsStateService.saveState(this.router.url, this);
    this.criteria[this.displayedChild.identifier].where = this.criteria[this.displayedChild.identifier].where || {};
    this.criteria[this.displayedChild.identifier].where.paymentId = this.paymentId;
    let method = this.displayedChild.method || 'find';
    this.displayedChild.service[method](this.criteria[this.displayedChild.identifier]).subscribe((response: any) => {
      this.children[this.displayedChild.identifier] = response.data;
      this.dataSource = new MatTableDataSource(this.children[this.displayedChild.identifier]);
      this.length = response.metaData.count;
    });
  }

  public searchMerchants(event: any = null, id = null) {
    let value = this.tappedMerchantName;
    let criteria: any = {limit: 5, hideSpinner: true};
    if (id !== null) {
      criteria.where = {id: id};
    } else {
      criteria.where = {name: {'like': '%' + value + '%'}};
    }
    this.merchantService.find(criteria).subscribe((response: any) => {
      this.merchantList = response.data;
      if (id !== null) {
        this.setSelectedMerchant(response.data[0]);
      }
    });
  }

  public setSelectedMerchant(merchant: any) {
    this.selectedMerchant = merchant;
    setTimeout(() => this.tappedMerchantName = merchant.name);
    this.payment.merchant = merchant;
    this.payment.merchantId = merchant.id;
    this.generateLabel();
    this.loadBalance(this.payment.merchantId);
  }

  private loadBalance(merchantId: Number) {
    this.balanceService.find({where: {merchantId: merchantId}}).subscribe((response: any) => {
      this.balance = response.data[0] || {};
      this.provisionalBalance = this.balance.balance || 0;
    });
  }

  public generateLabel() {
    if (this.payment.canceled)
      return;
    let label: string = "";
    if (this.selectedMerchant && this.selectedMerchant.id)
      label += this.selectedMerchant.name;
    else if (this.context == 1)
      label += 'Ste Poissons Amich';
    if (this.payment.paymentType) {
      let type = _.find(this.paymentTypes, {id: this.payment.paymentTypeId});
      if (type)
        label += "-" + type.name;
    }
    if (this.payment.date) {
      label += "-" + moment(this.payment.date).format("YYYY-MM-DD");
    }
    if (this.payment.value)
      label += "_" + this.payment.value.toString() + 'DT';
    this.payment.name = label;
  }

  public verifyAmount() {
    if (this.payment.value && this.payment.value < 0) {
      this.updateForm.controls['valueFormControl'].setErrors({error: 'Le montant du réglement ne peut pas être négatif!'});
      return;
    }
    if (this.payment.value && this.payment.consumed) {
      if (this.payment.value < this.payment.consumed)
        this.updateForm.controls['valueFormControl'].setErrors({error: 'Le montant du réglement (' + this.payment.value + ') est inférieur au total des règlements livraisons (' + this.payment.consumed + ')'});
      else
        this.updateForm.controls['valueFormControl'].setErrors(null);
    }
    this.provisionalBalance = Number(this.balance.balance || 0) + Number(this.payment.value);
    if (this.oldPayment)
      this.provisionalBalance -= Number(this.oldPayment.value || 0);
    this.provisionalBalance = Number(this.provisionalBalance.toFixed(2));
    this.payment.rest = parseFloat(String(this.payment.value - this.payment.consumed)).toFixed(3);
  }

  public setSelectedPaymentType(event: any, id = null) {
    if (id)
      this.payment.paymentType = _.find(this.paymentTypes, {id: id});
    else
      this.payment.paymentType = _.find(this.paymentTypes, {id: event.value});
    this.payment.paymentTypeId = this.payment.paymentType.id;
    this.checkPaymentTypeRequirements();
    this.generateLabel();
  }

  checkPaymentTypeRequirements() {
    if (!this.payment || !this.payment.paymentType)
      return;
    this.isCheckType = this.payment.paymentType.reference == 'CHEQUE';
    this.isPromissoryType = this.payment.paymentType.reference == 'PROMISSORY';
    if (this.isCheckType || this.isPromissoryType) {
      this.updateForm.controls['numberFormControl'].setValidators([Validators.required]);
      this.updateForm.controls['bankFormControl'].setValidators([Validators.required]);
      this.updateForm.controls['dueDateFormControl'].setValidators([Validators.required]);
      this.updateForm.controls['signatoryFormControl'].setValidators([Validators.required]);
    } else {
      this.updateForm.controls['numberFormControl'].clearValidators();
      this.updateForm.controls['numberFormControl'].updateValueAndValidity();
      this.updateForm.controls['bankFormControl'].clearValidators();
      this.updateForm.controls['bankFormControl'].updateValueAndValidity();
      this.updateForm.controls['dueDateFormControl'].clearValidators();
      this.updateForm.controls['dueDateFormControl'].updateValueAndValidity();
      this.updateForm.controls['signatoryFormControl'].clearValidators();
      this.updateForm.controls['signatoryFormControl'].updateValueAndValidity();
    }
    this.cd.detectChanges();
  }

  public setSelectedBank(event: any, id = null) {
    if (id)
      this.payment.bank = _.find(this.banks, {id: id});
    else
      this.payment.bank = _.find(this.banks, {id: event.value});
    this.payment.bankId = this.payment.bank.id;
  }

  public setSelectedConsumptionInfo(event: any, id = null) {
    if (id)
      this.payment.consumptionInfo = _.find(this.consumptionInfos, {id: id});
    else
      this.payment.consumptionInfo = _.find(this.consumptionInfos, {id: event.value});
    this.payment.consumptionInfoId = this.payment.consumptionInfo.id;
  }

  isValidForm() {
    return this.updateForm.valid;
  }
}
