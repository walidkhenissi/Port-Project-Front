import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {Observable, catchError, map, startWith, switchMap} from 'rxjs';
import {BoatActivityType} from 'src/app/models/boat.activity.type';
import {BoatService} from 'src/app/services/boat.service';
import {of as observableOf} from 'rxjs';
import {Router, ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../services/grids-state.service";
import {FilterDialogComponent} from "../dialogs/filter-dialog/filter-dialog.component";
import {ConfirmDialogComponent} from "../dialogs/confirm-dialog/confirm-dialog.component";
import {BoatActivityTypeService} from "../../../services/boat-activity-type.service";
import {CommissionService} from "../../../services/commission.service";
import {BeneficiaryService} from "../../../services/beneficiary.service";
import {ArticleService} from "../../../services/article.service";
import {BankService} from "../../../services/bank.service";

@Component({
  selector: 'app-general.settings',
  templateUrl: './general.settings.component.html',
  styleUrls: ['./general.settings.component.scss']
})
export class GeneralSettingsComponent {

  public tab: any = 0;
  public childrenToDisplay: any;
  public displayedChild: any;
  public children: any = {}
  selectedTabIndex: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private gridsStateService: GridsStateService,
    private boatActivityTypeService: BoatActivityTypeService,
    private commissionService: CommissionService,
    private beneficiaryService: BeneficiaryService,
    private articleService: ArticleService,
    private bankService: BankService,
    private cdr: ChangeDetectorRef) {
    this.childrenToDisplay = [{
      entityName: 'BoatActivityType',
      routePrefix: "/ui-components/boat-activity-type",
      label: 'Type d\'activité',
      defaultSort: {name: 'asc'},
      service: this.boatActivityTypeService
    }, {
      entityName: 'commission',
      routePrefix: "/ui-components/commission",
      label: 'Commission',
      defaultSort: {name: 'asc'},
      service: this.commissionService
    }, {
      entityName: 'beneficiary',
      routePrefix: "/ui-components/beneficiary",
      label: 'Bénéficiaires',
      defaultSort: {name: 'asc'},
      service: this.beneficiaryService
    }, {
      entityName: 'article',
      routePrefix: "/ui-components/article",
      label: 'Articles',
      defaultSort: {name: 'asc'},
      service: this.articleService
    }, {
      entityName: 'bank',
      routePrefix: "/ui-components/bank",
      label: 'Banques',
      defaultSort: {name: 'asc'},
      service: this.bankService
    }];
    this.route.params.subscribe(params => {
      this.tab = params['tab'] || 0;
      this.initChildrenTabs();
    });
  }

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

  displayedColumns: string[] = ['name', 'edit', 'delete'];
  commissionsDisplayedColumns: string[] = ['name', 'value', 'payer', 'edit', 'delete'];
  dataSource = new MatTableDataSource<BoatActivityType>();
  BoatActivityTypeData: BoatActivityType[];
  totalData: number;

  ngOnInit() {
    let router = this.router.url;
    // if (this.tab == "0" && router.includes("/1"))
    //   router = router.replace('/1', '');
    const child = this.childrenToDisplay[this.tab];
    if (!this.gridsStateService.loadState(router, child)) {
      this.criteria[this.displayedChild.entityName].where = this.criteria[this.displayedChild.entityName].where || {};
      this.criteria[this.displayedChild.entityName].limit = this.pageSize;
      this.criteria[this.displayedChild.entityName].skip = 0;
      this.criteria[this.displayedChild.entityName].sort = {name: 'asc'};
      this.switchChildTab(this.tab);
    } else
      this.switchChildTab(this.tab);
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
    this.findChildren();
  }

  public findChildren() {
    this.gridsStateService.saveState(this.router.url, this.displayedChild);
    if (!this.displayedChild)
      this.displayedChild = this.childrenToDisplay[0];
    let method = this.displayedChild.method || 'find';
    this.displayedChild.service[method](this.criteria[this.displayedChild.entityName]).subscribe((response: any) => {
      this.children[this.displayedChild.entityName] = response.data;
      if (this.displayedChild.entityName === 'commission')
        this.refactorCommissions()
      this.dataSource = new MatTableDataSource(this.children[this.displayedChild.entityName]);
      this.length = response.metaData.count;
    });
  }

  refactorCommissions() {
    Object.keys(this.children[this.displayedChild.entityName]).forEach((i) => {
      const commission = this.children[this.displayedChild.entityName][i];
      this.children[this.displayedChild.entityName][i].availableCommissionHistory = commission.CommissionHistories.find((element: any) => !element.endDate);
    });
  }

  public initChildrenTabs() {
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
      this.findChildren();
    }, (response: any) => {
      let msg = 'Impossible de continuer. Une erreure est survenue!';
      if (response.error.error.errorCode === "#USED_DATA_ERROR") {
        if (this.displayedChild.entityName === 'beneficiary')
          msg = 'Impossible de continuer. Le bénéficiaire est déjà utilisé par une commission!'
        else if (this.displayedChild.entityName === 'BoatActivityType')
          msg = "Impossible de continuer. Le type d'activité est déjà utilisé par un bateau!"
        else if (this.displayedChild.entityName === 'commission')
          msg = "Impossible de continuer. La commission est déjà utilisée par une ou plusieurs vente(s)!"
        else if (this.displayedChild.entityName === 'article')
          msg = "Impossible de continuer. L'article est déjà utilisée par une ou plusieurs vente(s)!"
        else if (this.displayedChild.entityName === 'bank')
          msg = "Impossible de continuer. La banque est déjà utilisée par un ou plusieurs paiement(s)!"
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
    });
  }

  public editChild(child: any) {
    let parms = [this.displayedChild.routePrefix, "edit", child.id];
    if (this.displayedChild.entityName === 'commission')
      parms.push(0);
    else
      // if (this.displayedChild.entityName === 'beneficiary')
      parms.push(this.selectedTabIndex);
    this.router.navigate(parms);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
