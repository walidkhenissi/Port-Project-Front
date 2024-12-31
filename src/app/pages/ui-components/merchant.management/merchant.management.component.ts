import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {Observable, catchError, startWith, switchMap, map} from 'rxjs';
import {MerchantsService} from 'src/app/services/merchant.service';
import {of as observableOf} from 'rxjs';
import {Merchant} from 'src/app/models/merchant';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../services/grids-state.service";
import {FilterDialogComponent} from "../dialogs/filter-dialog/filter-dialog.component";
import {ConfirmDialogComponent} from "../dialogs/confirm-dialog/confirm-dialog.component";

export interface Merchants {
  id: number
  civility: string;
  firstName: string;
  lastName: string;
  city: string;
}

@Component({
  selector: 'app-merchant.management',
  templateUrl: './merchant.management.component.html',
  styleUrls: ['./merchant.management.component.scss']
})

export class MerchantManagementComponent {

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private gridsStateService: GridsStateService,
    private merchantService: MerchantsService,
    private cdr: ChangeDetectorRef
  ) {

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

  displayedColumns: string[] = ['civility', 'firstName', 'lastName', 'city', 'update', 'delete'];
  dataSource = new MatTableDataSource<Merchant>();
  MerchantData: Merchant[];
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

  ngAfterViewInit() {
    this.refresh();
  }

  refresh() {
    this.gridsStateService.saveState(this.router.url, this);
    this.merchantService.find(this.criteria).subscribe((response: any) => {
      this.length = response.metaData.count;
      this.MerchantData = response.data;
      this.dataSource = new MatTableDataSource(this.MerchantData);
    });
  }

  deleteMerchant(id: number, confirm: boolean): void {
    if (confirm === false) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: 'Etes-vous sûr de vouloir supprimer cet armateur ?',
          title: 'Attention!',
          confirm: () => this.deleteMerchant(id, true),
          reject: () => {
          }
        }
      });
      return;
    }
    this.merchantService.remove(id).subscribe(
      (result: any) => {
        console.log('Merchant deleted successfully');
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
        console.error('Error deleting merchant:', error);
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public edit(merchant: any) {
    this.router.navigate(["merchant/edit/", merchant.id]);
  }

  public add() {
    this.router.navigate(["merchant/add"]);
  }
}
