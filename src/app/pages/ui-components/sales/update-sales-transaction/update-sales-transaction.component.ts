import {Component, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {SaleService} from "../../../../services/sale.service";
import {MerchantsService} from "../../../../services/merchant.service";
import {SalesTransactionService} from "../../../../services/sales-transaction.service";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../../services/grids-state.service";
import {GenericService} from "../../../../services/generic.service";
import {ArticleService} from "../../../../services/article.service";
import 'lodash';
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {SalesTransactionPaymentService} from "../../../../services/sales-transaction-payment.service";
import {MatTableDataSource} from "@angular/material/table";
import {FilterDialogComponent} from "../../dialogs/filter-dialog/filter-dialog.component";

declare var _: any;

@Component({
  selector: 'app-update-sales-transaction',
  templateUrl: './update-sales-transaction.component.html',
  styleUrls: ['./update-sales-transaction.component.scss']
})
export class UpdateSalesTransactionComponent {

  public salesTransactionId: number;
  public saleId: number;
  public sale: any = new Object();
  public salesTransaction: any = new Object();
  public updateForm: FormGroup;
  public tab: any;
  viewContext = false;
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
              private merchantService: MerchantsService,
              private articleService: ArticleService,
              private salesTransactionPaymentService: SalesTransactionPaymentService,
              private salesTransactionService: SalesTransactionService,
              private dialog: MatDialog,
              private router: Router,
              private gridsStateService: GridsStateService,
              private genericService: GenericService) {
    this.childrenToDisplay = [{
      identifier: 'salesTransactionPayment',
      entityName: 'salesTransaction_Payment',
      routePrefix: "/ui-components/salesTransactionPayment",
      label: 'Règlements',
      method: 'findWithDetails',
      service: this.salesTransactionPaymentService,
      // defaultFilter: {paymentTypeId: this.paymentId},
      defaultSort: {date: 'desc'},
      displayedColumns: ['date', 'value', 'transactionNumber', 'paymentType', 'edit', 'delete']
    }];
    this.route.params.subscribe(params => {
      this.salesTransactionId = params['id'];
      this.saleId = params['saleId'];
      this.tab = params['tab'] || 0;
      this.initChildrenTabs();
    });
    if (this.router.url.indexOf('view') > 0)
      this.viewContext = true;
  }

  ngOnInit(): void {
    if (!this.gridsStateService.loadState(this.router.url + '/' + this.selectedTabIndex, this)) {
      this.criteria[this.displayedChild.identifier].where = this.criteria[this.displayedChild.identifier].where || {};
      this.criteria[this.displayedChild.identifier].limit = this.pageSize;
      this.criteria[this.displayedChild.identifier].skip = 0;
      this.criteria[this.displayedChild.identifier].sort = {date: 'desc'};
    }
    this.updateForm = new FormGroup({
      merchantFormControl: new FormControl('', Validators.required),
      articleFormControl: new FormControl('', Validators.required),
      quittanceFormControl: new FormControl(''),
      totalToPayByMerchantFormControl: new FormControl({value: '', disabled: true}),
      boxesFormControl: new FormControl('', Validators.min(0)),
      grossWeightFormControl: new FormControl('', Validators.min(0)),
      subtractedWeightFormControl: new FormControl('', Validators.min(0)),
      netWeightFormControl: new FormControl({value: '', disabled: true}, Validators.min(0)),
      unitPriceFormControl: new FormControl('', Validators.compose([Validators.required, Validators.min(0)])),
      totalPriceFormControl: new FormControl({
        value: '',
        disabled: true
      }, Validators.compose([Validators.required, Validators.min(0)]))
    });
    if (this.salesTransactionId)
      this.salesTransactionService.getOne(this.salesTransactionId).subscribe((response: any) => {
        this.salesTransaction = response.data;
        if (this.salesTransaction.merchant)
          this.setSelectedMerchant(this.salesTransaction.merchant);
        if (this.salesTransaction.article)
          this.setSelectedArticle(this.salesTransaction.article)
        this.switchChildTab(this.selectedTabIndex);
      });
    else
      this.salesTransaction.saleId = this.saleId;
    if (this.viewContext)
      this.disableAll();
  }

  public tappedMerchantName: string;
  public selectedMerchant: any;
  public merchants: any;

  public searchMerchants(event: any = null, id = null) {
    if (event && event.key === 'Enter')
      return;
    this.updateForm.controls['merchantFormControl'].setErrors({noValue: true});
    let value = this.tappedMerchantName;
    let criteria: any = {limit: 5, sort: {name: 'asc'}, hideSpinner: true};
    if (id !== null) {
      criteria.where = {id: id};
    } else {
      criteria.where = {name: {'like': '%' + value + '%'}};
    }
    this.merchantService.find(criteria).subscribe((response: any) => {
      this.merchants = response.data;
      if (id !== null) {
        this.setSelectedMerchant(response.data[0]);
      }
    });
  }

  public setSelectedMerchant(merchant: any) {
    this.selectedMerchant = merchant;
    this.salesTransaction.merchantId = merchant.id;
    setTimeout(() => this.tappedMerchantName = merchant. lastName+ ' ' + merchant.firstName);
    this.updateForm.controls['merchantFormControl'].setErrors(null);
  }

  public tappedArticleName: string;
  public selectedArticle: any;
  public articles: any;

  public searchArticles(event: any = null, id = null) {
    if (event && event.key === 'Enter')
      return;
    this.updateForm.controls['articleFormControl'].setErrors({noValue: true});
    let value = this.tappedArticleName;
    let criteria: any = {limit: 5, sort: {name: 'asc'}, hideSpinner: true};
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

  public setSelectedArticle(article: any) {
    this.selectedArticle = article;
    this.salesTransaction.articleId = article.id;
    setTimeout(() => this.tappedArticleName = article.name);
    this.updateForm.controls['articleFormControl'].setErrors(null);
  }

  save() {
    let request: Observable<any>;
    if (this.salesTransactionId)
      request = this.salesTransactionService.update(this.salesTransaction);
    else
      request = this.salesTransactionService.create(this.salesTransaction);
    request.subscribe((response: any) => {
        this.goBack();
      },
      // Managing Get_User errors
      (response: any) => {
        let msg = '!';
        msg = response.error.msg;
        if (response.error.error.error)
          msg = response.error.error.error;
        if (response.error.error.errorCode === "#INTERNAL_ERROR")
          msg = 'Impossible le continuer! Une erreure interne est survenue.';
        if (response.error.error.errorCode === "#EXCEED_PAYMENT_VALUE")
          msg = 'Impossible le continuer! La somme des paiements affectés dépasse la valeur de la vente!';
        if (msg)
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              message: msg,
              title: 'Attention!',
              confirm: () => {
                if (this.salesTransactionId) {
                  this.findChildren();
                }
              },
              hideReject: true
            }
          });
      });
  }

  calculateValues() {
    if (this.salesTransaction.boxes && this.salesTransaction.boxes > 0 && !this.salesTransaction.grossWeight) {
      //Product selled by box
      this.salesTransaction.totalPrice = this.salesTransaction.boxes * this.salesTransaction.unitPrice;
    } else if (this.salesTransaction.boxes && this.salesTransaction.grossWeight) {
      //Product selled by Kg in boxes
      this.salesTransaction.netWeight = this.salesTransaction.grossWeight - (this.salesTransaction.subtractedWeight || 0);
      this.salesTransaction.totalPrice = this.salesTransaction.netWeight * this.salesTransaction.unitPrice;
    } else if (!this.salesTransaction.boxes && this.salesTransaction.grossWeight && this.salesTransaction.grossWeight > 0) {
      //Product selled by Kg without boxes
      this.salesTransaction.netWeight = this.salesTransaction.grossWeight - (this.salesTransaction.subtractedWeight || 0);
      this.salesTransaction.totalPrice = this.salesTransaction.netWeight * this.salesTransaction.unitPrice;
    }
    // this.salesTransaction.totalPrice = this.salesTransaction.boxes * this.salesTransaction.unitPrice;
  }

  goBack() {
    if (this.viewContext)
      this.router.navigate(['/ui-components/merchantPurchases']);
    else
      this.router.navigate(['/ui-components/sales/edit', this.saleId, this.tab]);
  }

  isValidForm() {
    return this.updateForm.valid;
  }

  public disableAll() {
    for (let control in this.updateForm.controls)
      if (!this.updateForm.controls[control].disabled)
        this.updateForm.controls[control].disable();
  }

  public showFilterIcon(attr: string) {
    return this.lastFilterConfig[this.displayedChild.identifier][attr] || this.mouseOverHeader[this.displayedChild.identifier][attr];
  }

  public editChild(child: any) {
    if (this.viewContext)
      this.router.navigate([this.displayedChild.routePrefix, "edit", child.id, this.selectedTabIndex]);
    else
      this.router.navigate([this.displayedChild.routePrefix, "edit", this.saleId, child.id, this.selectedTabIndex]);
  }

  public addChild() {
    if (this.viewContext)
      this.router.navigate([this.displayedChild.routePrefix, "add", this.salesTransactionId, this.selectedTabIndex]);
    else
      this.router.navigate([this.displayedChild.routePrefix, "add", this.saleId, this.salesTransactionId, this.selectedTabIndex]);
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
    this.criteria[this.displayedChild.identifier].where = this.criteria[this.displayedChild.identifier].where || {};
    this.criteria[this.displayedChild.identifier].where.salesTransactionId = this.salesTransactionId;
    let method = this.displayedChild.method || 'find';
    this.displayedChild.service[method](this.criteria[this.displayedChild.identifier]).subscribe((response: any) => {
      this.children[this.displayedChild.identifier] = response.data;
      this.dataSource = new MatTableDataSource(this.children[this.displayedChild.identifier]);
      this.length = response.metaData.count;
      this.totalPayments = _.sumBy(this.children[this.displayedChild.identifier], 'value');
      this.restTopay = this.salesTransaction.totalToPayByMerchant - this.totalPayments;
    });
  }

}
