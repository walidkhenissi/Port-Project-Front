import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../../services/grids-state.service";
import {SalesTransactionService} from "../../../../services/sales-transaction.service";
import {FilterDialogComponent} from "../../dialogs/filter-dialog/filter-dialog.component";
import {CommissionValuesService} from "../../../../services/commission-values.service";
import {GenericService} from "../../../../services/generic.service";

@Component({
  selector: 'app-commission-details',
  templateUrl: './commission-details.component.html',
  styleUrls: ['./commission-details.component.scss']
})
export class CommissionDetailsComponent implements OnInit {

  beneficiaryId: number;
  beneficiary: any;
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

  displayedColumns: string[] = ['date', 'commissionName', 'commissionValue', 'recipientNumber', 'saleTransactionNumber'];
  dataSource = new MatTableDataSource<any>();
  commissionValuesData: [];
  totalCommissionValues = 0;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private gridsStateService: GridsStateService,
              private genericService: GenericService,
              private commissionValuesService: CommissionValuesService,
              private cdr: ChangeDetectorRef
  ) {
    this.route.params.subscribe(params => {
      this.beneficiaryId = params['beneficiaryId'];
    });
  }


  ngOnInit() {
    if (!this.gridsStateService.loadState(this.router.url, this)) {
      this.criteria.limit = this.pageSize;
      this.criteria.skip = 0;
      this.criteria.sort = {date: 'desc'};
      this.find();
    }
    if (this.beneficiaryId) {
      this.genericService.find('beneficiary', {where: {id: this.beneficiaryId}}).subscribe((response: any) => {
        this.beneficiary = (response.data && response.data.length)? response.data[0]:undefined;
      });
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
    this.criteria.where = this.criteria.where || {};
    this.criteria.where.commissionBeneficiaryId = this.beneficiaryId;
    this.commissionValuesService.findWithDetails(this.criteria).subscribe((response: any) => {
      this.length = response.metaData.count;
      this.totalCommissionValues = response.metaData.sum;
      this.commissionValuesData = response.data;
      this.dataSource = new MatTableDataSource(response.data);
    });
  }

  goBack() {
    this.router.navigate(["/ui-components/balance/", 2]);
  }

}
