import {Component, OnInit, Inject, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {GenericService} from "../../../../services/generic.service";


@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<FilterDialogComponent>, private genericService: GenericService) {
  }

  // MatPaginator Inputs
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 15];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  // MatPaginator Output
  pageEvent: PageEvent;

  private enumCriteria: any = {where: {}};

  config: any = {
    rule: 'equals',
    value1: undefined,
    value2: undefined,
    date1: new Date(),
    date2: new Date(),
    hour1: 0,
    hour2: 0,
    minute1: 0,
    minute2: 0,
    seconde1: 0,
    seconde2: 0,
    selectedOptions: []
  };

  enumeration: any = [];

  timeForm1: FormGroup;
  timeForm2: FormGroup;
  enumerationForm: FormGroup;

  public paginationEvent($event: PageEvent) {
    this.pageEvent = $event;
    if (this.pageEvent) {
      this.enumCriteria.limit = this.pageEvent.pageSize;
      this.enumCriteria.skip = this.pageEvent.pageIndex * this.pageEvent.pageSize
    } else {
      this.enumCriteria.limit = this.pageSize;
      this.enumCriteria.skip = 0;
    }
    this.findEnums();
  }

  public resetPage() {
    this.paginator.pageIndex = 0;
    this.paginator.page.next({
      pageIndex: 0,
      pageSize: this.paginator.pageSize,
      length: this.paginator.length
    });
    this.enumCriteria.skip = 0;
  }

  public sortEvent() {
    this.enumCriteria.sort = this.enumCriteria.sort || {};
    this.enumCriteria.sort[this.data.enumLabel] = 1 - this.enumCriteria.sort[this.data.enumLabel];
    this.resetPage();
    this.findEnums();
  }

  private buildSortEnum() {
    if (this.data.enumLabel.indexOf('+') === -1) {
      let x = this.data.enumLabel.split('|');
      x = x[0].split(':');
      this.enumCriteria.sort[x[0]] = 'ASC';
    } else {
      let x = this.data.enumLabel.split('|');
      x = x[0].split('+');
      for (let attr of x) {
        let key = attr.split(':')[0];
        this.enumCriteria.sort[key] = 'ASC';
      }
    }
  }

  private buildWhereEnum(word: string) {
    if (this.data.enumLabel.indexOf('+') === -1) {
      let x = this.data.enumLabel.split('|');
      x = x[0].split(':');
      this.enumCriteria.where[x[0]] = {'like': '%' + word + '%'};
    } else {
      let x = this.data.enumLabel.split('|');
      x = x[0].split('+');
      this.enumCriteria.where.or = [];
      for (let attr of x) {
        let key = attr.split(':')[0];
        let cr = {};
        // @ts-ignore
        cr[key] = {'like': '%' + word + '%'}
        this.enumCriteria.where.or.push(cr);
      }
    }
  }

  public filterEvent(word: any) {
    if (word.value && word.value.trim().length > 0)
      word = word.value;
    else
      word = "";
    if (word !== null && word !== undefined && word !== '')
      this.buildWhereEnum(word);
    //this.enumCriteria.where[this.data.enumLabel] = {'like': '%' + word + '%'};
    else {
      delete this.enumCriteria.where[this.data.enumLabel];
      delete this.enumCriteria.where['or'];
    }
    this.resetPage();
    this.findEnums();
  }

  public findEnums() {
    let query;
    if (this.data.forcedEnumFindMethod) {
      // const filter = Object.entries(this.data.forcedEnumFindMethod)[0];
      // this.enumCriteria.where[filter[0]] = filter[1];
      query = this.data.forcedEnumFindMethod.service[this.data.forcedEnumFindMethod.method](this.enumCriteria);
    } else {
      query = this.genericService.find(this.data.enumEntity, this.enumCriteria);
    }
    // this.genericService.find(this.data.enumEntity, this.enumCriteria).subscribe((response: any) => {
    query.subscribe((response: any) => {
      this.enumeration = response.data;
      this.length = response.metaData.count;
    });
  }


  ngOnInit() {
    this.timeForm1 = new FormGroup({
      hour1Control: new FormControl('', [Validators.min(0), Validators.max(23)]),
      minute1Control: new FormControl('', [Validators.min(0), Validators.max(59)]),
      seconde1Control: new FormControl('', [Validators.min(0), Validators.max(59)])
    });
    this.timeForm2 = new FormGroup({
      hour2Control: new FormControl('', [Validators.min(0), Validators.max(23)]),
      minute2Control: new FormControl('', [Validators.min(0), Validators.max(59)]),
      seconde2Control: new FormControl('', [Validators.min(0), Validators.max(59)])
    });
    this.enumerationForm = new FormGroup({
      enumerationList: new FormControl('')
    });
    if (this.data.lastConfig) {
      this.config = this.data.lastConfig;
    }
    if (this.data.type === 'enumeration') {
      this.dialogRef.updateSize('30%', '82%');
      if (this.data.limit) {
        this.pageSize = this.data.limit;
      }
      this.enumCriteria.limit = this.pageSize;
      this.enumCriteria.skip = 0;
      this.enumCriteria.sort = {};
      if (this.data.enumCriteria) {
        let x = this.data.enumCriteria.split('|');
        x = x[0].split(':');
        this.enumCriteria.where = this.enumCriteria.where || {};
        this.enumCriteria.where[x[0]] = x[1];
      }
      if (this.data.forcedEnumFilter) {
        const filter = Object.entries(this.data.forcedEnumFilter)[0];
        this.enumCriteria.where[filter[0]] = filter[1];
      }
      //this.enumCriteria.sort[this.data.enumLabel] = 1;
      this.buildSortEnum();
      this.findEnums();
    }
  }

  public confirm() {
    let attrCriteria = undefined;
    if (this.data.type === 'string') {
      switch (this.config.rule) {
        case 'equals':
          attrCriteria = this.config.value1;
          break;
        case 'notEquals':
          attrCriteria = {'!': this.config.value1};
          break;
        case 'contains':
          attrCriteria = {'like': '%' + this.config.value1 + '%'};
          break;
        case 'startsWith':
          attrCriteria = {'like': this.config.value1 + '%'};
          break;
        case 'endsWith':
          attrCriteria = {'like': '%' + this.config.value1};
          break;
        case 'isNull':
          attrCriteria = null;
          break;
        default:
          attrCriteria = undefined;
          break;
      }
    } else if (this.data.type === 'number' || this.data.type === 'datetime' || this.data.type === 'date') {
      if (this.data.type === 'datetime') {
        if (moment.isMoment(this.config.date1)) {
          this.config.date1.set("hour", this.config.hour1);
          this.config.date1.set("minute", this.config.minute1);
          this.config.date1.set("second", this.config.seconde1);
        } else {
          this.config.date1.setHours(this.config.hour1);
          this.config.date1.setMinutes(this.config.minute1);
          this.config.date1.setSeconds(this.config.seconde1);
        }
        if (this.config.rule === 'between') {
          if (moment.isMoment(this.config.date2)) {
            this.config.date2.set("hour", this.config.hour2);
            this.config.date2.set("minute", this.config.minute2);
            this.config.date2.set("second", this.config.seconde2);
          } else {
            this.config.date2.setHours(this.config.hour2);
            this.config.date2.setMinutes(this.config.minute2);
            this.config.date2.setSeconds(this.config.seconde2);
          }
        }
      } else if (this.data.type === 'date') {
        if (moment.isMoment(this.config.date1)) {
          this.config.date1.set("hour", 0);
          this.config.date1.set("minute", 0);
          this.config.date1.set("second", 0);
        } else {
          this.config.date1.setHours(0);
          this.config.date1.setMinutes(0);
          this.config.date1.setSeconds(0);
        }
        if (this.config.rule === 'between') {
          if (moment.isMoment(this.config.date2)) {
            this.config.date2.set("hour", 0);
            this.config.date2.set("minute", 0);
            this.config.date2.set("second", 0);
          } else {
            this.config.date2.setHours(0);
            this.config.date2.setMinutes(0);
            this.config.date2.setSeconds(0);
          }
        }
      }
      switch (this.config.rule) {
        case 'equals':
          let start = new Date(this.config.date1);
          if (this.data.type === 'number')
            attrCriteria = this.config.value1;
          else if (this.data.type === 'datetime')
            attrCriteria = this.config.date1;
          else if (this.data.type === 'date') {
            attrCriteria = {'>=': this.startOfDay(this.config.date1), "<=": this.endOfDay(this.config.date1)};
          }
          break;
        case 'notEquals':
          attrCriteria = {'!': this.data.type === 'number' ? this.config.value1 : this.config.date1};
          break;
        case 'lowerThan':
          attrCriteria = {'<': this.data.type === 'number' ? this.config.value1 : this.config.date1};
          break;
        case 'greaterThan':
          attrCriteria = {'>': this.data.type === 'number' ? this.config.value1 : this.config.date1};
          break;
        case 'between':
          attrCriteria = {'between': this.data.type === 'number' ? [this.config.value1, this.config.value2] : [this.config.date1, this.config.date2]}
          // attrCriteria = {
          //   '>': this.data.type === 'number' ? this.config.value1 : this.config.date1,
          //   '<': this.data.type === 'number' ? this.config.value2 : this.config.date2
          // };
          break;
        case 'isNull':
          attrCriteria = null;
          break;
        default:
          attrCriteria = undefined;
          break;
      }
    } else if (this.data.type === 'enumeration') {
      if (this.config.selectedOptions && this.config.selectedOptions.length)
        attrCriteria = this.config.selectedOptions;
      else
        attrCriteria = undefined;
    } else if (this.data.type === 'boolean') {
      if (this.config.rule === 'isChecked')
        attrCriteria = [1, true];
      else if (this.config.rule === 'isUnchecked') {
        attrCriteria = [0, false];
      }
    }

    if (attrCriteria !== undefined) {
      this.data.criteria.where[this.data.name] = attrCriteria;
      this.data.filterEvent(this.config);
    } else {
      this.disableFilter();
    }
    this.dialogRef.close();
  }

  public reject() {
    this.dialogRef.close();
  }

  private disableFilter() {
    delete this.data.criteria.where[this.data.name];
    this.data.filterEvent(null);
  }

  public disable() {
    this.disableFilter();
    this.dialogRef.close();
  }

  public toggleEnum(item: any) {
    let index = this.config.selectedOptions.indexOf(item.id);
    if (index === -1)
      this.config.selectedOptions.push(item.id);
    else
      this.config.selectedOptions.splice(index, 1);
  }

  public isEnumSelected(item: any) {
    return this.config.selectedOptions.indexOf(item.id) > -1;
  }

  private startOfDay(date: any) {
    let day: Date = new Date(date);
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  }

  private endOfDay(date: any) {
    let day: Date = new Date(date);
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
  }

}
