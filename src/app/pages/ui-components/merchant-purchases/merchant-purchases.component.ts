import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {Router} from "@angular/router";
import {SalesTransactionService} from "../../../services/sales-transaction.service";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../services/grids-state.service";
import {FilterDialogComponent} from "../dialogs/filter-dialog/filter-dialog.component";
import {Constants} from "../../../constants";
import {ConfirmDialogComponent} from "../dialogs/confirm-dialog/confirm-dialog.component";
// @ts-ignore
import {saveAs} from 'file-saver';
import {FormControl, Validators} from "@angular/forms";
import {ArticleService} from "../../../services/article.service";
import {MerchantsService} from "../../../services/merchant.service";
import {ShipownersService} from "../../../services/shipowner.service";

@Component({
  selector: 'app-merchant-purchases',
  templateUrl: './merchant-purchases.component.html',
  styleUrls: ['./merchant-purchases.component.scss']
})
export class MerchantPurchasesComponent implements OnInit {


  articleFormControl: FormControl;
  producerFormControl: FormControl;
  commercantFormControl: FormControl;

  public articles: any;
  public merchants: any;
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

  displayedColumns: string[] = ['date', 'merchant', 'receiptNumber', 'quittance', 'transactionNumber', 'article', 'boxes', 'netWeight', 'unitPrice', 'totalPrice', 'totalToPayByMerchant', 'paymentInfo', 'details'];
  dataSource = new MatTableDataSource<any>();
  saleTransactionsData: [];
  totalToPayByMerchants = 0;

  @ViewChild('salesTransactionStatsPopup') salesTransactionStatsDialg: TemplateRef<any>;
  @ViewChild('accountStatsPopup') accountStatsDialg: TemplateRef<any>;

  public rule: string = 'readAll';
  public date1 = new Date();
  public date2 = new Date();
  public articleName: string;
  public producerName: string;
  public merchantName: string;
  private enumCriteria: any = {where: {}};

  selectedMerchant: any
  tappedMerchantName: string;
  selectedArticle: any;
  tappedArticleName: string;
  public dialogRef: any;

  public excelType: boolean = true;  // Excel est coché par défaut
  public pdfType: boolean = false;


  constructor(
    private router: Router,
    private dialog: MatDialog,
    private gridsStateService: GridsStateService,
    private salesTransactionService: SalesTransactionService,
    private cdr: ChangeDetectorRef,
    private articleService: ArticleService,
    private merchantService: MerchantsService
  ) {

  }


  ngOnInit() {
    this.articleFormControl = new FormControl('', Validators.required);
    this.commercantFormControl = new FormControl('', Validators.required);


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

  public filterEvent(attr: string, type: string, entity: string | null = null, label: string | null = null, size: number | null = null) {
    this.dialog.open(FilterDialogComponent, {
      data: {
        name: attr,
        type: type,
        limit: size,
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
    this.salesTransactionService.find(this.criteria).subscribe((response: any) => {
      this.length = response.metaData.count;
      this.totalToPayByMerchants = response.metaData.sum;
      this.saleTransactionsData = response.data;
      this.dataSource = new MatTableDataSource(response.data);
    });
  }


  public edit(salesTransaction: any) {
    this.router.navigate(["/ui-components/salesTransaction/view/", salesTransaction.id, salesTransaction.saleId]);
  }

  public searchArticle(id = null, event: any = null) {
    if (event && event.key === 'Enter')
      return;
    this.selectedArticle = null;
    let value = this.tappedArticleName;
    let criteria: any = {limit: 5, hideSpinner: true};
    if (id !== null) {
      criteria.where = {id: id};
    } else {
      criteria.where = {name: {'like': '%' + value + '%'}};
    }
    this.articleService.find(criteria).subscribe((response: any) => {
      this.articles = response.data;
      if (id !== null) {
        this.setSelectedArticle(response.data[0]);
      }
    });
  }

  public setSelectedArticle(article: any): void {
    this.selectedArticle = article;
    setTimeout(() => this.tappedArticleName = article.name);
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

  public generateReport() {
    const options = {
      dateRule: this.rule,
      startDate: this.formatDate(this.date1) || new Date(),
      endDate: this.rule == "equals" ? null : (this.formatDate(this.date2) || new Date()),
      article: this.selectedArticle ? this.selectedArticle.id : null,
      merchant: this.selectedMerchant ? this.selectedMerchant.id : null,
      excelType: this.excelType,
      pdfType: this.pdfType

    };
    return this.salesTransactionService.generateSalesTransactionReport(options).subscribe((response: any) => {
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

  public generateReportState() {
    const options = {
      dateRule: this.rule,
      startDate: this.formatDate(this.date1) || new Date(),
      endDate: this.rule == "equals" ? null : (this.formatDate(this.date2) || new Date()),
      merchant: this.selectedMerchant ? this.selectedMerchant.id : null,
      excelType: this.excelType,
      pdfType: this.pdfType

    };
    return this.salesTransactionService.generateAccountReport(options).subscribe((response: any) => {
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
    this.dialogRef = this.dialog.open(this.salesTransactionStatsDialg, {
      width: '500px',
    });

  }
  public openDialogAccount() {
    this.dialogRef = this.dialog.open(this.accountStatsDialg, {
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
