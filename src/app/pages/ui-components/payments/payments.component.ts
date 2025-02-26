import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../services/grids-state.service";
import {FilterDialogComponent} from "../dialogs/filter-dialog/filter-dialog.component";
import 'lodash';
import {PaymentService} from "../../../services/payment.service";
import {ConfirmDialogComponent} from "../dialogs/confirm-dialog/confirm-dialog.component";
import {FormControl, Validators} from "@angular/forms";
import {Constants} from "../../../constants";
import {MerchantsService} from "../../../services/merchant.service";
// @ts-ignore
import {saveAs} from 'file-saver';
import {ShipownersService} from "../../../services/shipowner.service";
declare var _: any;

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit{

  public merchants: any;
  public producers: any;
  commercantFormControl: FormControl;
  producerFormControl: FormControl;
  public mouseOvered: any = new Object();
  public mouseOverHeader: any = new Object();

  // MatPaginator Inputs
  public length = 0;
  public pageSize = 10;
  public pageSizeOptions: number[] = [5, 10, 25, 100, 200, 500, 1000];
  @ViewChild(MatPaginator) paginator: MatPaginator;
// MatPaginator Output
  public pageEvent: PageEvent;

  public lastFilterConfig: any = {};
  public criteria: any = {where: {}};

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();
  paymentsData: [];
  totalPayments = 0;
  merchantPayments = false;
  commissionaryPayments = false;
  title = '';
  titlePopup='';

  @ViewChild('paymentStatusPopup') paymentStatusDialg: TemplateRef<any>;
  public rule: string = 'readAll';
  public date1 = new Date();
  public date2 = new Date();
  public merchantName: string;
  private enumCriteria: any = {where: {}};

  selectedMerchant: any
  tappedMerchantName: string;

  selectedProducer:any;
  tappedProducerName: string;

  public dialogRef: any;

  public excelType: boolean = true;  // Excel est coché par défaut
  public pdfType: boolean = false;


  constructor(
    private router: Router,
    private dialog: MatDialog,
    private gridsStateService: GridsStateService,
    private paymentService: PaymentService,
    private merchantService: MerchantsService,
    private shipownerService:ShipownersService,
    private cdr: ChangeDetectorRef
  ) {
    const url = this.router.url;
    this.merchantPayments = _.includes(url, 'merchantPayment');
    this.commissionaryPayments = _.includes(url, 'commissionaryPayment');
    if (this.merchantPayments)
    { this.title = 'Paiements des commerçants';
      this.titlePopup='État de Paiements des commerçants';
    } else{
      this.title = 'Paiements du commissionaire';
    this.titlePopup='État de Paiements du commissionaire';
    }
    if (this.commissionaryPayments)
      this.displayedColumns = ['date', 'value', 'type', 'number', 'dueDate', 'consumptionInfo', 'details', 'remove'];
    else
      this.displayedColumns = ['date', 'merchant', 'value', 'type', 'number', 'dueDate', 'consumptionInfo', 'details', 'remove'];
  }


  ngOnInit() {
    this.commercantFormControl = new FormControl('', Validators.required);
    this.producerFormControl = new FormControl('', Validators.required);
    if (!this.gridsStateService.loadState(this.router.url, this)) {
      this.criteria.limit = this.pageSize;
      this.criteria.skip = 0;
      this.criteria.sort = {date: 'desc'};
      this.find();
    }
  }

  public paginationEvent($event: PageEvent) {
    this.pageEvent = $event;
    if (this.pageEvent) {
      this.criteria.limit = this.pageEvent.pageSize;
      this.criteria.skip = this.pageEvent.pageIndex * this.pageEvent.pageSize
    } else {
      this.criteria.limit = this.pageSize;
      this.criteria.skip = 0;
    }
    this.find();
  }

  public sortEvent($event: any) {
    if (!$event.active || $event.direction === '') {
      delete this.criteria.sort;
      return;
    }
    this.criteria.sort = {};
    this.criteria.sort[$event.active] = $event.direction;
    this.resetPage();
  }

  public resetPage() {
    this.paginator.pageIndex = 0;
    this.paginator.page.next({
      pageIndex: 0,
      pageSize: this.paginator.pageSize,
      length: this.paginator.length
    });
    this.criteria.skip = 0;
  }

  public filterEvent(attr: string, type: string, entity: string | null = null, label: string | null = null) {
    this.dialog.open(FilterDialogComponent, {
      data: {
        name: attr,
        type: type,
        enumEntity: entity,
        enumLabel: label,
        lastConfig: this.lastFilterConfig[attr],
        criteria: this.criteria,
        filterEvent: (config: any) => {
          this.lastFilterConfig[attr] = config;
          this.resetPage();
        }
      }
    });
  }

  public showFilterIcon(attr: string) {
    return this.lastFilterConfig[attr] || this.mouseOverHeader[attr];
  }

  ngAfterViewInit() {
    this.find();
  }

  find() {
    this.gridsStateService.saveState(this.router.url, this);
    this.criteria.where = this.criteria.where || {};
    if (this.merchantPayments) {
      if (!this.criteria.where.merchantId)
        this.criteria.where.merchantId = {'!': null};
      this.criteria.where.isCommissionnaryPayment = false;
    } else if (this.commissionaryPayments) {
      this.criteria.where.merchantId = null;
      this.criteria.where.isCommissionnaryPayment = true;
    }
    if (!this.criteria.sort) {
      this.criteria.sort = {date: 'DESC'};
    }
    this.paymentService.find(this.criteria).subscribe((response: any) => {
      this.length = response.metaData.count;
      this.paymentsData = response.data;
      this.totalPayments = response.metaData.sum;
      this.dataSource = new MatTableDataSource(response.data);
    });
  }

  public add() {
    this.router.navigate(["/ui-components/payment/add", this.getContext(), 0]);
  }

  public edit(payment: any) {
    this.router.navigate(["/ui-components/payment/edit/", payment.id, this.getContext(), 0]);
  }

  public remove(payment: any, confirm: boolean) {
    if (payment.isStartBalance) {
      return;
    }
    if (confirm === false) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: 'Etes-vous sûr de vouloir supprimer ce règlement?',
          title: 'Attention!',
          confirm: () => this.remove(payment, true),
          reject: () => {
          }
        }
      });
      return;
    }
    this.paymentService.remove(payment.id).subscribe(
      (result: any) => {
        console.log('Sale deleted successfully');
        this.find();
      }, (response: any) => {
        let msg = 'Impossible de continuer. Une erreure est survenue!';
        if (response.error.error.errorCode === "#NOT_FOUND_ERROR")
          msg = 'Impossible de continuer. Une erreure est survenue!';
        else if (response.error.error.errorCode === "#USED_DATA_ERROR") {
          if (this.commissionaryPayments)
            msg = 'Impossible de continuer. Le paiement est déjà utilisé pour régler des ventes.';
          else
            msg = 'Impossible de continuer. Le paiement est déjà utilisé pour payer des achats.';
        } else if (response.error.error.msg)
          msg = response.error.error.msg;
        else if (response.error.error.error)
          msg = response.error.error.error;
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            message: msg,
            title: 'Attention!',
            confirm: () => {
            },
            hideReject: true
          }
        });
      }
    );
  }

  getContext() {
    if (this.commissionaryPayments)
      return 1;
    if (this.merchantPayments)
      return 2;
    return -1;
  }
  public searchProducers(id = null, event: any = null) {
    if (event && event.key === 'Enter')
      return;
    this.selectedProducer = null;
    let value = this.tappedProducerName;
    let criteria: any = {limit: 5, hideSpinner: true};
    if (id !== null) {
      criteria.where = {id: id};
    } else {
      criteria.where = {name: {'like': '%' + value + '%'}};
    }
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

  public setSelectedProducer(producer: any): void {
    this.selectedProducer = producer;
    setTimeout(() => this.tappedProducerName = producer.name);
  }


  public searchMerchant(id = null, event: any = null) {
    if (event && event.key === 'Enter')
      return;
    this.selectedMerchant = null;
    let value = this.tappedMerchantName;
    let criteria: any = {limit: 5, hideSpinner: true};
    if (id !== null) {
      criteria.where = {id: id};
    } else {
      criteria.where = {name: {'like': '%' + value + '%'}};
    }
    this.merchantService.find(criteria).subscribe((response: any) => {
      this.merchants = response.data;

    });
  }

  public setSelectedMerchant(merchant: any): void {
    this.selectedMerchant = merchant;
    setTimeout(() => this.tappedMerchantName = merchant.name);
  }

  public formatDate = (date: any) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // mois de 01 à 12
    const day = d.getDate().toString().padStart(2, '0'); // jour de 01 à 31
    return `${year}-${month}-${day}`;
  };



  public generateReportState() {
    const options:any = {
      dateRule: this.rule,
      startDate: this.formatDate(this.date1) || new Date(),
      endDate: this.rule == "equals" ? null : (this.formatDate(this.date2) || new Date()),
      excelType: this.excelType,
      pdfType: this.pdfType
    };
    if (this.commissionaryPayments) {
      options.producer = this.selectedProducer ? this.selectedProducer.name: null;
    } else {
      options.merchant = this.selectedMerchant ? this.selectedMerchant.id : null;
    }
    console.log("option:",options);

    if (this.commissionaryPayments) {
      return this.paymentService.generateCommissionaireReport(options).subscribe((response: any) => {
          saveAs(Constants.API_DOWNLOAD_URL + "/" + response.data, response.data);
          this.dialogRef.close();
        }
        , (response: any) => {
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              message: 'Une erreur s\'est produite ',
              title: 'Attention!',
              confirm: () => {
              },
              hideReject: true
            }
          });
        });
    }
     else {
      return this.paymentService.generatePaymentReport(options).subscribe((response: any) => {
          saveAs(Constants.API_DOWNLOAD_URL + "/" + response.data, response.data);
          this.dialogRef.close();
        }
        , (response: any) => {
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              message: 'Une erreur s\'est produite ',
              title: 'Attention!',
              confirm: () => {
              },
              hideReject: true
            }
          });
        });
    }

  }

  public openDialog() {
    this.dialogRef = this.dialog.open(this.paymentStatusDialg, {
      width: '500px',
    });

  }


  togglePDFType(checked: boolean) {
    this.pdfType = !this.pdfType;
    this.excelType = false;
  }

  toggleExcelType(checked: boolean) {
    this.excelType = !this.excelType;
    this.pdfType = false;
  }

  public isDisabled() {
    if (!this.excelType && !this.pdfType)
      return true;
    if (this.rule !== 'readAll' && this.rule !== 'between' && this.isFalsey(this.date1))
      return true;
    if (this.rule == 'between' && (this.isFalsey(this.date1) || this.isFalsey(this.date2)))
      return true;
    return false;
  }

  private isFalsey(value: any) {
    return value === null || value === undefined || value === 'undefined' || value === '' || value === NaN;
  }

}
