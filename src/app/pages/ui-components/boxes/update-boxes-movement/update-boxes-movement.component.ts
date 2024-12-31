import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {BoxesBalanceService} from "../../../../services/boxes-balance.service";
import {ShipownersService} from "../../../../services/shipowner.service";
import {MerchantsService} from "../../../../services/merchant.service";
import {BoxesTransactionService} from "../../../../services/boxes-transaction.service";
import {MatDialog} from "@angular/material/dialog";
import {GridsStateService} from "../../../../services/grids-state.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {forkJoin, Observable} from "rxjs";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";
import * as moment from 'moment';

@Component({
  selector: 'app-update-boxes-movement',
  templateUrl: './update-boxes-movement.component.html',
  styleUrls: ['./update-boxes-movement.component.scss']
})
export class UpdateBoxesMovementComponent {

  boxesTransactionId: number = 0;
  boxesBalanceId: number = 0;
  isShipOwnerCase: boolean = false;
  isMerchantCase: boolean = false;
  previousTab1Index: number = 0;
  previousTab2Index: number = 0;
  updateForm: FormGroup;
  boxesBalance: any = new Object();
  boxesTransaction: any = new Object();
  oldBoxesTransaction: any = new Object();
  toDay = new Date();

  constructor(private route: ActivatedRoute,
              private boxesBalanceService: BoxesBalanceService,
              private shipownerService: ShipownersService,
              private merchantService: MerchantsService,
              private boxesTransactionService: BoxesTransactionService,
              private dialog: MatDialog,
              private router: Router,
              private gridsStateService: GridsStateService) {
    this.route.params.subscribe(params => {
      this.boxesTransactionId = params['id'];
      this.boxesBalanceId = params['boxesBalanceId'];
      this.previousTab1Index = params['prevTab1'] || 0;
      this.previousTab2Index = params['prevTab2'] || 0;
    });
  }

  ngOnInit() {
    this.updateForm = new FormGroup({
      dateFormControl: new FormControl(''),
      debitFormControl: new FormControl(''),
      creditFormControl: new FormControl(''),
      balanceFormControl: new FormControl({value: '', disabled: true}),
      noteFormControl: new FormControl('')
    });
    if (!this.boxesTransactionId)
      this.boxesBalanceService.getOne(this.boxesBalanceId).subscribe((response: any) => {
        this.boxesBalance = response.data;
        this.boxesTransaction.date = new Date();
        this.adaptView();
      });
    else {
      forkJoin(
        this.boxesBalanceService.getOne(this.boxesBalanceId),
        this.boxesTransactionService.getOne(this.boxesTransactionId)
      ).subscribe(([response1, response2]: Array<any>) => {
        this.boxesBalance = response1.data;
        this.boxesTransaction = response2.data;
        this.oldBoxesTransaction = JSON.parse(JSON.stringify(this.boxesTransaction));
        this.adaptView();
      });
    }
  }

  adaptView() {
    if (this.boxesBalance.shipOwnerId)
      this.isShipOwnerCase = true;
    else if (this.boxesBalance.merchantId)
      this.isMerchantCase = true;
    if ((this.isShipOwnerCase && this.boxesTransaction.credit) || (this.isMerchantCase && this.boxesTransaction.debit))
      this.updateForm.controls['dateFormControl'].disable();
    if (this.isShipOwnerCase) {
      this.updateForm.controls['debitFormControl'].addValidators(Validators.required);
      this.updateForm.controls['creditFormControl'].disable();
    } else if (this.isMerchantCase) {
      this.updateForm.controls['creditFormControl'].addValidators(Validators.required);
      this.updateForm.controls['debitFormControl'].disable();
    }
  }

  save() {
    if (!this.boxesBalance)
      return;
    if (this.boxesBalance.shipOwnerId)
      this.boxesTransaction.shipOwnerId = this.boxesBalance.shipOwnerId;
    else if (this.boxesBalance.merchantId)
      this.boxesTransaction.merchantId = this.boxesBalance.merchantId;
    let request: Observable<any>;
    if (this.boxesTransactionId) {
      if ((this.boxesTransaction.debit && !this.oldBoxesTransaction.debit) || (this.boxesTransaction.credit && !this.oldBoxesTransaction.credit))
        this.boxesTransaction.date = this.setTime(this.boxesTransaction.date);
      request = this.boxesTransactionService.update(this.boxesTransaction);
    } else {
      if (this.isShipOwnerCase)
        this.boxesTransaction.credit = 0;
      if (this.isMerchantCase)
        this.boxesTransaction.debit = 0;
      this.boxesTransaction.date = this.setTime(this.boxesTransaction.date);
      request = this.boxesTransactionService.create(this.boxesTransaction);
    }
    request.subscribe((response: any) => {
        this.goBack();
      },
      // Managing Get_User errors
      (response: any) => {
        let msg = 'Erreure!';
        if (response.error.error.errorCode === "#INTERNAL_ERROR")
          msg = 'Impossible le continuer! Une erreure interne est survenue.';
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

  setTime(date: Date) {
    let _moment = moment(date);
    const now = new Date();
    _moment.set({
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds()
    });
    return _moment.toDate();
  }

  goBack() {
    this.router.navigate(['/ui-components/boxes/edit/', this.boxesBalanceId, this.previousTab1Index, this.previousTab2Index]);
  }

  isValidForm() {
    return this.updateForm.valid;
  }
}
