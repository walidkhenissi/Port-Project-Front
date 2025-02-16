import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ShipownersService} from 'src/app/services/shipowner.service';
import {GenericService} from "../../../../services/generic.service";
import {forkJoin} from "rxjs";
import {BoatService} from "../../../../services/boat.service";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {BoatActivityType} from "../../../../models/boat.activity.type";
import {GridsStateService} from "../../../../services/grids-state.service";
import {FilterDialogComponent} from "../../dialogs/filter-dialog/filter-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-update-shipowner',
  templateUrl: './update-shipowner.component.html',
  styleUrls: ['./update-shipowner.component.scss']
})
export class UpdateShipownerComponent {

  shipownerId: number;
  updateForm: FormGroup;
  civilities: Array<any>;
  shipOwner: any = new Object();

  public tab: any = 0;
  public childrenToDisplay: any;
  public displayedChild: any;
  public children: any = {}
  selectedTabIndex: number = 0;
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

  displayedColumns: string[] = ['name', 'serialNumber', 'edit', 'delete'];
  dataSource = new MatTableDataSource<BoatActivityType>();

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private shipownerService: ShipownersService,
    private boatService: BoatService,
    private genericService: GenericService,
    private gridsStateService: GridsStateService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.childrenToDisplay = [{
      entityName: 'boat',
      routePrefix: "/ui-components/ship",
      label: 'Bateau',
      defaultSort: {name: 'asc'},
      service: this.boatService
    }]
    this.route.params.subscribe((params) => {
      this.shipownerId = params['id'];
      this.tab = params['tab'] || 0;
      this.initChildrenTabs();
    });
    this.shipOwner.civility = {};
    this.shipOwner.address = {};
    this.shipOwner.enabled = true;
  }

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      civilityControl: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl("", Validators.required),
      socialReason: new FormControl(''),
      taxRegistrationNumber: new FormControl(''),
      phoneNumber: new FormControl(),
      enabled: new FormControl(true, Validators.required),
      addressStreet: new FormControl(""),
      addressCity: new FormControl('', Validators.required),
      addressPostalCode: new FormControl("")
    });
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
    if (this.shipownerId) {
      forkJoin(
        this.shipownerService.getOne(this.shipownerId),
        this.genericService.find('Civility')
      ).subscribe(([response1, response2]: Array<any>) => {
        this.shipOwner = response1.data;
        this.shipOwner.civility = this.shipOwner.civility || {};
        this.shipOwner.address = this.shipOwner.address || {};
        this.civilities = response2.data;
      });
    } else {
      this.genericService.find('Civility').subscribe((response: any) => {
        this.civilities = response.data;
      });
    }
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
      if (this.shipownerId) {
        this.criteria[this.childrenToDisplay[i].entityName].where = this.criteria[this.childrenToDisplay[i].entityName].where || {};
        this.criteria[this.childrenToDisplay[i].entityName].where.shipOwnerId = this.shipownerId;
      }
    }
  }

  paginationEvent($event: PageEvent) {
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

  sortEvent($event: any) {
    if (!$event.active || $event.direction === '') {
      delete this.criteria[this.displayedChild.entityName].sort;
      return;
    }
    this.criteria[this.displayedChild.entityName].sort = {};
    this.criteria[this.displayedChild.entityName].sort[$event.active] = $event.direction;
    this.resetPage();
  }

  resetPage() {
    this.paginator.pageIndex = 0;
    this.paginator.page.next({
      pageIndex: 0,
      pageSize: this.paginator.pageSize,
      length: this.paginator.length
    });
    this.criteria[this.displayedChild.entityName].skip = 0;
  }

  filterEvent(attr: string, type: string, entity: string | null = null, label: string | null = null) {
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

  showFilterIcon(attr: string) {
    return this.lastFilterConfig[this.displayedChild.entityName][attr] || this.mouseOverHeader[this.displayedChild.entityName][attr];
  }

  switchChildTab(index: number) {
    this.selectedTabIndex = index;
    this.displayedChild = this.childrenToDisplay[index];
    this.findChildren();
  }

  findChildren() {
    this.gridsStateService.saveState(this.router.url, this.displayedChild);
    if (!this.displayedChild)
      this.displayedChild = this.childrenToDisplay[0];
    let method = this.displayedChild.method || 'find';
    this.displayedChild.service[method](this.criteria[this.displayedChild.entityName]).subscribe((response: any) => {
      this.children[this.displayedChild.entityName] = response.data;
      this.dataSource = new MatTableDataSource(this.children[this.displayedChild.entityName]);
      this.length = response.metaData.count;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  removeChild(child: any, confirm: boolean) {
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
        if (this.displayedChild.entityName === 'boat')
          msg = 'Impossible de continuer. Le bateau est déjà utilisé par une donnée!'
      } else if (response.error.error.msg)
        msg = response.error.error.msg;
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

  editChild(child: any) {
    let parms = [this.displayedChild.routePrefix, "edit", child.id, this.shipownerId, this.selectedTabIndex];
    this.router.navigate(parms);
  }

  addShipowner() {
    this.shipownerService.create(this.shipOwner)
      .subscribe(
        (result: any) => {
          this.router.navigate(['/ui-components/shipowner-management']);
        },
        error => {
          console.log(error);
        });
  }

  updateShipowner(): void {
    this.shipownerService.update(this.shipOwner).subscribe(
      (result: any) => {
        console.log('Shipowner and associated address updated successfully');
        this.router.navigate(['/ui-components/shipowner-management']);
      }, (result: any) => {
        if (result.error) {
          console.error('Error updating shipowner:', result.error);
        }
      }
    );
  }

  toggleAnabled(checked: boolean) {
    this.shipOwner.enabled = checked;
  }

  isValidForm() {
    return this.updateForm.valid;
  }
}
