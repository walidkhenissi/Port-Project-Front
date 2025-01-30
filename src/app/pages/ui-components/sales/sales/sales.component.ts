import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../../services/grids-state.service";
import {SaleService} from "../../../../services/sale.service";
import {ArticleService} from "../../../../services/article.service";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {Merchant} from "../../../../models/merchant";
import {FilterDialogComponent} from "../../dialogs/filter-dialog/filter-dialog.component";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";
import {SalesTransactionService} from 'src/app/services/sales-transaction.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MerchantsService} from 'src/app/services/merchant.service';
import {ShipownersService} from "../../../../services/shipowner.service";
// @ts-ignore
import {saveAs} from 'file-saver';
import {Constants} from "../../../../constants";

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  [x: string]: any;


  producerFormControl: FormControl;


  filteredArticles: any[] = []; // Liste filtrée



  public producers: any;


  public mouseOvered: any = new Object();
  public mouseOverHeader: any = new Object();

  // MatPaginator Inputs
  public length = 0;
  public pageSize = 10;
  public pageSizeOptions: number[] = [5, 10, 25, 100];
  @ViewChild(MatPaginator) paginator: MatPaginator;
// MatPaginator Output
  public pageEvent: PageEvent;

  public lastFilterConfig: any = {};
  public criteria: any = {where: {}};

  displayedColumns: string[] = ['date', 'number', 'producerName', 'total', 'paymentInfo', 'update', 'delete'];
  dataSource = new MatTableDataSource<Merchant>();
  salesData: Merchant[];
  totalSales = 0;
  @ViewChild('salesStatsPopup') salesStatsDialg: TemplateRef<any>;
  public rule: string;
  public ruleSolde:string;
  public date1 = new Date();
  public date2 = new Date();
  public solde1: number;
  public solde2:number;
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
    private saleService: SaleService,
    private shipownerService: ShipownersService,
    private cdr: ChangeDetectorRef,
    private salesTransactionService: SalesTransactionService,

  ) {

  }

  ngOnInit() {


    this.producerFormControl = new FormControl('', Validators.required);// Formulaire pour gérer tous les filtres



    if (!this.gridsStateService.loadState(this.router.url, this)) {
      this.criteria.limit = this.pageSize;
      this.criteria.skip = 0;
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
    this.saleService.find(this.criteria).subscribe((response: any) => {
      this.length = response.metaData.count;
      this.totalSales = response.metaData.sum;
      this.salesData = response.data;
      this.dataSource = new MatTableDataSource(this.salesData);
    });
  }

  deleteSale(id: number, confirm: boolean): void {
    if (confirm === false) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: 'Etes-vous sûr de vouloir supprimer cet armateur ?',
          title: 'Attention!',
          confirm: () => this.deleteSale(id, true),
          reject: () => {
          }
        }
      });
      return;
    }
    this.saleService.remove(id).subscribe(
      (result: any) => {
        console.log('Sale deleted successfully');
        this.find();
      },
      (response) => {
        console.error('Error deleting Sale:', response);
        let msg = '!';
        msg = response.error.msg;
        if (response.error.error.error)
          msg = response.error.error.error;
        else if (response.error.error.errorCode === "#INTERNAL_ERROR")
          msg = 'Impossible le continuer! Une erreure interne est survenue.';
        else if (response.error.error.errorCode === "#ATTACHED_SALES_TRANSACTIONS")
          msg = 'Impossible le continuer! Des lignes de ventes sont attachées à la peche. Veuillez les supprimer en premier lieu!';
        else if (response.error.error.errorCode === "#ATTACHED_PAYMENTS")
          msg = 'Impossible le continuer! Des paiements sont attachés à la peche. Veuillez les supprimer en premier lieu!';
        if (msg)
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              message: msg,
              title: 'Attention!',
              confirm: () => {
                this.find();
              },
              hideReject: true
            },
            width: '450px'
          });
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public edit(sale: any) {
    this.router.navigate(["/ui-components/sales/edit/", sale.id, 0]);
  }

  public add() {
    this.router.navigate(["/ui-components/sales/add", 0]);
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



  public generateReport() {
  const formatDate=(date: any)=>{
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // mois de 01 à 12
    const day = d.getDate().toString().padStart(2, '0'); // jour de 01 à 31
    return `${year}-${month}-${day}`;
    };

const options={
      dateRule: this.rule,
      soldeRule:this.ruleSolde,
      startDate: formatDate(this.date1) || new Date(),
      endDate: this.rule == "equals"? null : (formatDate(this.date2) || new Date()),
      producer: this.selectedProducer ? this.selectedProducer.id: null,
      solde1:this.solde1,
      solde2:this.solde2,
      excelType: this.excelType,
      pdfType: this.pdfType

};


    return this.saleService.generateSalesReport(options).subscribe((response: any) => {
      alert(response.data);
      console.log("response.data :", response.data);
      saveAs(Constants.API_DOWNLOAD_URL + "/" + response.data, response.data);
      this.dialogRef.close();
    }, (response: any) => {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: 'Une erreur s\'est produite ',
          title: 'Attention!',
          confirm: () => {},
          hideReject: true
        }
      });
    });
  }

  public openDialog() {
    this.dialogRef=this.dialog.open(this.salesStatsDialg, {
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
}
