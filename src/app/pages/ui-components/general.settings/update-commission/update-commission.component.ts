import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {GenericService} from "../../../../services/generic.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CommissionService} from "../../../../services/commission.service";
import {find, forkJoin, Observable} from "rxjs";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {CommissionHistoryService} from "../../../../services/commission-history.service";
import {GridsStateService} from "../../../../services/grids-state.service";
import {MatDialog} from "@angular/material/dialog";
import {FilterDialogComponent} from "../../dialogs/filter-dialog/filter-dialog.component";
import {MatTableDataSource} from "@angular/material/table";
import {BoatActivityType} from "../../../../models/boat.activity.type";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";
import {BeneficiaryService} from "../../../../services/beneficiary.service";
import {CommissionBeneficiaryService} from "../../../../services/commission-beneficiary.service";

@Component({
  selector: 'app-update-commission',
  templateUrl: './update-commission.component.html',
  styleUrls: ['./update-commission.component.scss']
})
export class UpdateCommissionComponent {

  commission: any = new Object();
  updateForm: FormGroup;
  commissionId: number;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['value', 'payer', 'startDate', 'endDate', 'edit', 'delete'];
  beneficiaryDisplayedColumns: string[] = ['name', 'startDate', 'endDate', 'edit', 'delete'];
  tab: any = 0;
  selectedTabIndex: number = 0;

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
  public pageSizeOptions: number[] = [5, 10, 25, 100, 200, 500, 1000];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // MatPaginator Output
  public pageEvent: PageEvent;

  constructor(
    private route: ActivatedRoute,
    private commissionService: CommissionService,
    private commissionHistoryService: CommissionHistoryService,
    private commissionBeneficiaryService: CommissionBeneficiaryService,
    private genericService: GenericService,
    private gridsStateService: GridsStateService,
    private router: Router,
    private dialog: MatDialog) {
    this.childrenToDisplay = [{
      entityName: 'commissionHistory',
      routePrefix: "/ui-components/commissionHistory",
      label: 'Valeurs de la commission',
      defaultSort: {startDate: 'asc'},
      service: this.commissionHistoryService
    }, {
      entityName: 'commissionBeneficiary',
      routePrefix: "/ui-components/beneficiary",
      label: 'Bénéficiaires de la commission',
      defaultSort: {name: 'asc'},
      service: this.commissionBeneficiaryService
    }];
    this.route.params.subscribe((params) => {
      this.commissionId = params['id'];
      this.tab = params['tab'] || 0;
      this.initChildrenTabs();
    });
  }

  ngOnInit(): void {
    const child = this.childrenToDisplay[this.tab];
    if (!this.gridsStateService.loadState(this.router.url, child)) {
      this.criteria[this.displayedChild.entityName].where = this.criteria[this.displayedChild.entityName].where || {};
      this.criteria[this.displayedChild.entityName].limit = this.pageSize;
      this.criteria[this.displayedChild.entityName].skip = 0;
      this.criteria[this.displayedChild.entityName].sort = child.defaultSort;
    }
    this.updateForm = new FormGroup({
      nameFormControl: new FormControl('', Validators.required)
    });
    this.find();
  }

  initChildrenTabs() {
    this.displayedChild = this.childrenToDisplay[this.tab];
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

  public paginationEvent($event: any) {
    this.pageEvent = $event;
    if (this.pageEvent) {
      this.criteria[this.displayedChild.entityName].limit = this.pageEvent.pageSize;
      this.criteria[this.displayedChild.entityName].skip = this.pageEvent.pageIndex * this.pageEvent.pageSize
    } else {
      this.criteria[this.displayedChild.entityName].limit = this.pageSize;
      this.criteria[this.displayedChild.entityName].skip = 0;
    }
    this.find();
  }

  public sortEvent($event: any) {
    if (!$event.active || $event.direction === '') {
      delete this.criteria[this.displayedChild.entityName].sort;
      return;
    }
    this.criteria[this.displayedChild.entityName].sort = {};
    this.criteria[this.displayedChild.entityName].sort[$event.active] = $event.direction;
    this.resetPage();
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

  public filterEvent(attr: any, type: any, entity = null, label = null) {
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
        }
      }
    });
  }

  public showFilterIcon(attr: string) {
    return this.lastFilterConfig[this.displayedChild.entityName][attr] || this.mouseOverHeader[this.displayedChild.entityName][attr];
  }

  public switchChildTab(index: number) {
    this.selectedTabIndex = index;
    this.displayedChild = this.childrenToDisplay[index];
    this.fillChildren();
  }

  public fillChildren() {
    if (this.commission) {
      if (this.displayedChild.entityName === 'commissionHistory' && this.commission.CommissionHistories) {
        this.dataSource = new MatTableDataSource(this.commission.CommissionHistories);
        this.length = this.commission.CommissionHistories.length;
      } else if (this.displayedChild.entityName === 'commissionBeneficiary' && this.commission.CommissionBeneficiaries) {
        this.commission.CommissionBeneficiaries.forEach(
          async (commissionBeneficiary: any) => {
            commissionBeneficiary.beneficiary = this.commission.beneficiaries.find((element: any) => element.id == commissionBeneficiary.beneficiaryId);
          });
        this.dataSource = new MatTableDataSource(this.commission.CommissionBeneficiaries);
        this.length = this.commission.CommissionBeneficiaries.length;
      }
    }
  }

  public find() {
    this.gridsStateService.saveState(this.router.url, this);
    if (this.commissionId) {
      this.commissionService.getOne(this.commissionId).subscribe((response: any) => {
        // this.netsService.find(this.criteria).subscribe((response: any) => {
        this.commission = response.data;
        this.fillChildren();
        this.switchChildTab(this.selectedTabIndex);
      });
    }
  }

  save() {
    let request: Observable<any>;
    if (this.commissionId)
      request = this.commissionService.update(this.commission);
    else
      request = this.commissionService.create(this.commission);
    request.subscribe(
      data => {
        this.router.navigate(['/ui-components/general-settings', 1]);
      },
      // Managing Get_User errors
      error => {
        console.log(error);
      });
  }

  public removeChild(child: any, confirm: boolean) {
    if (confirm === false) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: 'Etes-vous sûr de vouloir supprimer cet élément  ' + this.displayedChild.label + ' ?',
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
      },
      (response: any) => {
        let msg = 'Impossible de continuer. Une erreure est survenue!';
        if (response.error.error.errorCode === "#USED_DATA_ERROR") {
          if (this.displayedChild.entityName === 'commissionHistory')
            msg = "Impossible de continuer. Cette valeur de commission est déjà utilisée par une ou plusieurs vente(s)";
          else if (this.displayedChild.entityName === 'commissionBeneficiary')
            msg = "Impossible de continuer. Cette affectation de commission au bénéficiaire est déjà utilisée par une ou plusieurs vente(s)";
        }
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            message: msg,
            title: 'Attention!',
            confirm: () => {
            },
            hideReject: true
          }
        });
      });
  }

  goToAddCommissionHistory() {
    this.router.navigate(['/ui-components/commissionHistory/add', this.commissionId, this.selectedTabIndex]);
  }

  goToAddBeneficiary() {
    this.router.navigate(['/ui-components/commissionBeneficiary/add', this.commissionId, this.selectedTabIndex]);
  }

  // goToEditCommissionHistory(commissionHistory: any) {
  //   this.router.navigate(['/ui-components/commissionHistory/edit', commissionHistory.id]);
  // }

  isValidForm() {
    return this.commission.name ? true : false;
  }

}
