import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../../services/grids-state.service";
import {SaleService} from "../../../../services/sale.service";
import {CashTransactionService} from "../../../../services/cash-transaction.service";
import {FilterDialogComponent} from "../../dialogs/filter-dialog/filter-dialog.component";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-cash-transaction',
  templateUrl: './cash-transaction.component.html',
  styleUrls: ['./cash-transaction.component.scss']
})
export class CashTransactionComponent implements OnInit{

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

  displayedColumns: string[] = ['date', 'name', 'debit', 'credit', 'balance', 'update', 'delete'];
  dataSource = new MatTableDataSource<any>();
  transactionsData: any [];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private gridsStateService: GridsStateService,
    private cashTransactionService: CashTransactionService,
    private cdr: ChangeDetectorRef
  ) {

  }


  ngOnInit() {
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
    this.criteria.sort = {date: 'desc'};
    this.cashTransactionService.find(this.criteria).subscribe((response: any) => {
      this.length = response.metaData.count;
      this.transactionsData = response.data;
      this.dataSource = new MatTableDataSource(this.transactionsData);
    });
  }

  deleteTransaction(id: number, confirm: boolean): void {
    if (confirm === false) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: 'Etes-vous sûr de vouloir supprimer cette transaction?',
          title: 'Attention!',
          confirm: () => this.deleteTransaction(id, true),
          reject: () => {
          }
        }
      });
      return;
    }
    this.cashTransactionService.remove(id).subscribe(
      (result: any) => {
        console.log('CashTransaction deleted successfully');
        this.find();
      },
      (error) => {
        console.error('Error deleting CashTransaction:', error);
      }
    );
  }

  public edit(transaction: any) {
    this.router.navigate(["/ui-components/cashTransaction/edit/", transaction.id]);
  }

  public add() {
    this.router.navigate(["/ui-components/cashTransaction/add"]);
  }

}
