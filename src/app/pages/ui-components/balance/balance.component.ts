import {Component, TemplateRef, ViewChild} from '@angular/core';
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
import {FormControl, Validators} from "@angular/forms";
import {Constants} from "../../../constants";
// @ts-ignore
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent {


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
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // MatPaginator Output
  public pageEvent: PageEvent;
 @ViewChild('soldeProducerStatsPopup') soldeProducerStatsDialg: TemplateRef<any>;
  @ViewChild('soldeCommercantStatsPopup') soldeCommercantStatsDialg: TemplateRef<any>;
  public rule: string;
  public solde1 : number| null = null;
  public solde2 : number| null = null;
  public producerName: string;
  public merchantName: string;
  private enumCriteria: any = {where: {}};
  selectedProducer: any
  tappedProducerName: string;
  selectedMerchant: any
  tappedMerchantName: string;
  public dialogRef: any;

  public creditType: boolean = true;
  public debitType: boolean = true;

  /*************************/

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
    this.producerFormControl = new FormControl('', Validators.required);// Formulaire pour gérer tous les filtres
    this.commercantFormControl = new FormControl('', Validators.required);

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
  /***********Producteur ***********/
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


  public generateReportProducteur() {

    const options={
      soldeRule: this.rule,
      solde1: this.solde1,
      solde2: this.solde2,
      producer: this.selectedProducer ? this.selectedProducer.id: null,
      creditType: this.creditType,
      debitType: this.debitType

    };


    return this.balanceService.generateReportSoldeProducteur(options).subscribe((response: any) => {
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

  public openDialogP() {
    this.dialogRef=this.dialog.open(this.soldeProducerStatsDialg, {
      width: '500px',
    });

  }

  toggledebitType(checked: boolean) {
    this.debitType = !this.debitType;
    this.creditType = false;
  }

  togglecreditType(checked: boolean) {
    this.creditType = !this.creditType;
    this.debitType = false;
  }
/*******************Commercant ********************/
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


  public generateReportCommercant() {

    const options={
      soldeRule: this.rule,
      solde1:  this.solde1,
      solde2: this.solde2,
      merchant: this.selectedMerchant ? this.selectedMerchant.id: null,
      creditType: this.creditType,
      debitType: this.debitType

    };


    return this.balanceService.generateReportSoldeCommercant(options).subscribe((response: any) => {
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

  public openDialogC() {
    this.dialogRef=this.dialog.open(this.soldeCommercantStatsDialg, {
      width: '500px',
    });

  }




}
