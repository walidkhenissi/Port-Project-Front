import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
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
import {FormControl, Validators} from "@angular/forms";
import {Constants} from "../../../../constants";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";
// @ts-ignore
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-boxes',
  templateUrl: './boxes.component.html',
  styleUrls: ['./boxes.component.scss']
})
export class BoxesComponent implements OnInit {

  producerFormControl: FormControl;
  commercantFormControl: FormControl;
  public merchants: any;
  public producers: any;


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


  @ViewChild('caisseArmateurStatsPopup') caisseArmateurStatsDialg: TemplateRef<any>;
  @ViewChild('caisseMerchantStatsPopup') caisseMerchantStatsDialg: TemplateRef<any>;
  public rule: string = 'readAll';
  public date1 = new Date();
  public date2 = new Date();
  public producerName: string;
  public merchantName: string;
  private enumCriteria: any = {where: {}};
  selectedProducer: any
  tappedProducerName: string;
  selectedMerchant: any
  tappedMerchantName: string;

  public dialogRef: any;


  public excelType: boolean = true;
  public pdfType: boolean = false;
  public detailedReport: boolean = false;
  public summaryReport: boolean = true;


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
      displayedColumns: ['shipOwner', 'boxesType', 'debit', 'credit', 'balance', 'edit']
    }, {
      identifier: 'merchantBalance',
      entityName: 'boxesBalance',
      routePrefix: "/ui-components/boxes",
      label: 'Balance des Caisses vides des commerçants',
      service: this.boxesBalanceService,
      defaultFilter: {shipOwnerId: null, merchantId: {'!': null}},
      defaultSort: {balance: 'asc'},
      displayedColumns: ['merchant', 'boxesType', 'debit', 'credit', 'balance', 'edit']
    }, {
      identifier: 'transactions',
      entityName: 'boxesTransaction',
      routePrefix: "/ui-components/boxes",
      label: 'Stock des caisses',
      service: this.boxesTransactionService,
      defaultFilter: {isCommissionaryTransaction: true},
      defaultSort: {date: 'desc'},
      displayedColumns: ['date', 'name', 'boxesType', 'debit', 'credit', 'stock']
    }];
    this.route.params.subscribe(params => {
      this.selectedTabIndex = params['tab'] || 0;
      this.initChildrenTabs();
    });
  }

  ngOnInit() {
    this.producerFormControl = new FormControl('', Validators.required);
    this.commercantFormControl = new FormControl('', Validators.required);


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
      if (id !== null) {
        this.setSelectedProducer(response.data[0]);
      }
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

  public generateReportArmateur() {

    const options = {
      dateRule: this.rule,
      startDate: this.formatDate(this.date1) || new Date(),
      endDate: this.rule == "equals" ? null : (this.formatDate(this.date2) || new Date()),
      producer: this.selectedProducer ? this.selectedProducer.id : null,
      isMerchantProducer: this.selectedProducer ? this.selectedProducer.isMerchant : null,
      producerReport: true,
      excelType: this.excelType,
      pdfType: this.pdfType,
      detailedReport: this.detailedReport,
      summaryReport: this.summaryReport
    };


    return this.boxesBalanceService.generateReportShipOwner(options).subscribe((response: any) => {
      saveAs(Constants.API_DOWNLOAD_URL + "/" + response.data, response.data);
      this.dialogRef.close();
    }, (response: any) => {
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

  public generateReportMerchant() {

    const options = {
      dateRule: this.rule,
      startDate: this.formatDate(this.date1) || new Date(),
      endDate: this.rule == "equals" ? null : (this.formatDate(this.date2) || new Date()),
      merchant: this.selectedMerchant ? this.selectedMerchant.id : null,
      merchantReport: true,
      excelType: this.excelType,
      pdfType: this.pdfType,
      detailedReport: this.detailedReport,
      summaryReport: this.summaryReport
    };


    return this.boxesBalanceService.generateReportMerchant(options).subscribe((response: any) => {
      saveAs(Constants.API_DOWNLOAD_URL + "/" + response.data, response.data);
      this.dialogRef.close();
    }, (response: any) => {
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

  public generateSummaryReportMerchant() {
    return this.boxesBalanceService.generateSummaryReportMerchant().subscribe((response: any) => {
      saveAs(Constants.API_DOWNLOAD_URL + "/" + response.data, response.data);
    }, (response: any) => {
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

  public generateSummaryReportShipOwner() {
    return this.boxesBalanceService.generateSummaryReportShipOwner().subscribe((response: any) => {
      saveAs(Constants.API_DOWNLOAD_URL + "/" + response.data, response.data);
    }, (response: any) => {
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

  public openDialogArmateur() {
    this.dialogRef = this.dialog.open(this.caisseArmateurStatsDialg, {
      width: '500px',
    });

  }

  public openDialogMerchant() {
    this.dialogRef = this.dialog.open(this.caisseMerchantStatsDialg, {
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

  toggleDetailedReport(checked: boolean) {
    this.detailedReport = !this.detailedReport;
    this.summaryReport = false;
  }

  toggleSummaryReport(checked: boolean) {
    this.summaryReport = !this.summaryReport;
    this.detailedReport = false;
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
