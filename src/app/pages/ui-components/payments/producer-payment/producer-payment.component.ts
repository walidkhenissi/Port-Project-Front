import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../../services/grids-state.service";
import {FilterDialogComponent} from "../../dialogs/filter-dialog/filter-dialog.component";
import {SalePaymentService} from "../../../../services/sale-payment.service";
import {FormControl, Validators} from "@angular/forms";
import {Constants} from "../../../../constants";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";
import {ShipownersService} from "../../../../services/shipowner.service";
// @ts-ignore
import {saveAs} from 'file-saver';
@Component({
  selector: 'app-producer-payment',
  templateUrl: './producer-payment.component.html',
  styleUrls: ['./producer-payment.component.scss']
})
export class ProducerPaymentComponent implements OnInit{


  producerFormControl: FormControl;
  public producers: any;


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

  displayedColumns: string[] = ['date', 'producerName','saleName', 'paymentName', 'amount'];
  dataSource = new MatTableDataSource<any>();
  salePaymentsData: [];


  @ViewChild('paymentStatusPopup') paymentStatusDialg: TemplateRef<any>;
  public rule: string = 'readAll';
  public date1 = new Date();
  public date2 = new Date();
  public producerName: string;

  private enumCriteria: any = {where: {}};
  selectedProducer: any
  tappedProducerName: string;

  public dialogRef: any;

  public excelType: boolean = true;  // Excel est coché par défaut
  public pdfType: boolean = false;



  constructor(
    private router: Router,
    private dialog: MatDialog,
    private gridsStateService: GridsStateService,
    private salePaymentService: SalePaymentService,
    private shipownerService:ShipownersService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
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
    this.salePaymentService.findWithDetails(this.criteria).subscribe((response: any) => {
      this.length = response.metaData.count;
      this.salePaymentsData = response.data;
      this.dataSource = new MatTableDataSource(response.data);
    });
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


  public formatDate = (date: any) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // mois de 01 à 12
    const day = d.getDate().toString().padStart(2, '0'); // jour de 01 à 31
    return `${year}-${month}-${day}`;
  };



  public generateReportState() {
    const options = {
      dateRule: this.rule,
      startDate: this.formatDate(this.date1) || new Date(),
      endDate: this.rule == "equals" ? null : (this.formatDate(this.date2) || new Date()),
      producer:this.selectedProducer ? this.selectedProducer.id : null,
      excelType: this.excelType,
      pdfType: this.pdfType

    };
    console.log("options:",options);
    return this.salePaymentService.generateSalePaymentReport(options).subscribe((response: any) => {
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
