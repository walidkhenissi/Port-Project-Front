import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from "@angular/material/dialog";
import {catchError, startWith, switchMap, map, Observable} from 'rxjs';
import {Shipowner} from 'src/app/models/shipowner';
import {ShipownersService} from 'src/app/services/shipowner.service';
import {Router} from '@angular/router';
import {of as observableOf} from 'rxjs';
import {GridsStateService} from "../../../services/grids-state.service";
import {FilterDialogComponent} from "../dialogs/filter-dialog/filter-dialog.component";
import {ConfirmDialogComponent} from "../dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-shipowners.managament',
  templateUrl: './shipowners.managament.component.html',
  styleUrls: ['./shipowners.managament.component.scss']
})
export class ShipownersManagamentComponent {
  constructor(
    private shipownerService: ShipownersService,
    private router: Router,
    private dialog: MatDialog,
    private gridsStateService: GridsStateService,
    private cdr: ChangeDetectorRef) {
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


  displayedColumns: string[] = ['civility', 'lastName', 'firstName', 'taxRegistrationNumber', 'phoneNumber', 'update', 'delete'];
  dataSource = new MatTableDataSource<Shipowner>();
  ShipownerData: Shipowner[];
  totalData: number;

  ngOnInit() {
    if (!this.gridsStateService.loadState(this.router.url, this)) {
      this.criteria.limit = this.pageSize;
      this.criteria.skip = 0;
      this.refresh();
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
    this.refresh();
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

  getTableData$(pageNumber: Number, pageSize: Number) {
    // return this.shipownerService.find(pageNumber, pageSize);
    return this.shipownerService.find(this.criteria);
  }

  ngAfterViewInit() {
    this.refresh();
  }

  refresh() {
    this.gridsStateService.saveState(this.router.url, this);
    this.shipownerService.find(this.criteria).subscribe((response: any) => {
      this.length = response.metaData.count;
      this.ShipownerData = response.data;
      this.dataSource = new MatTableDataSource(this.ShipownerData);
    });
  }

  deleteShipowner(id: number, confirm: boolean): void {
    if (confirm === false) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: 'Etes-vous sûr de vouloir supprimer cet armateur ?',
          title: 'Attention!',
          confirm: () => this.deleteShipowner(id, true),
          reject: () => {
          }
        }
      });
      return;
    }
    this.shipownerService.remove(id).subscribe(
      (result: any) => {
        console.log('Shipowner deleted successfully');
        this.refresh();
      },
      (error) => {
        let msg = error.error.error.msg;
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            message: msg,
            title: 'Attention!',
            confirm: () => {
            },
            hideReject: true
          },
          width: '450px'
        });
        console.error('Error deleting shipowner:', error);
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
