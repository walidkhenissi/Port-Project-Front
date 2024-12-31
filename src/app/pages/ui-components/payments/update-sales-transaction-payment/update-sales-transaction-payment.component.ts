import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {PaymentService} from "../../../../services/payment.service";
import {SalesTransactionPaymentService} from "../../../../services/sales-transaction-payment.service";
import {GenericService} from "../../../../services/generic.service";
import {MatDialog} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {forkJoin} from "rxjs";
import {SalesTransactionService} from "../../../../services/sales-transaction.service";
import 'lodash';
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";

declare var _: any;

@Component({
  selector: 'app-update-sales-transaction-payment',
  templateUrl: './update-sales-transaction-payment.component.html',
  styleUrls: ['./update-sales-transaction-payment.component.scss']
})
export class UpdateSalesTransactionPaymentComponent {

  salesTransactionPaymentId: number;
  salesTransactionPayment: any = new Object();
  salesTransactionPaymentBeforeEdition: any = null;
  paymentId: number;
  salesTransactionId: number;
  payments: any = [];
  selectedPayment: any = new Object();
  tappedPaymentName: string;
  salesTransactions: any = [];
  selectedSalesTransaction: any = new Object();
  tappedSalesTransactionName: string;
  previousTabIndex: number = 0;
  paymentTypes: any = [];
  public updateForm: FormGroup;
  fromPayment = false;
  fromSalesTransaction = false;
  fromSale = false;
  saleId: number;
  context: number;
  consumedPayment: any = null;
  payedDelivery: any = null;
  payedPaymentInfo: any = new Object();
  consumedConsumptionInfo: any = new Object();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private paymentService: PaymentService,
              private salesTransactionPaymentService: SalesTransactionPaymentService,
              private salesTransactionService: SalesTransactionService,
              private genericService: GenericService) {
    this.route.params.subscribe(params => {
      this.salesTransactionPaymentId = params['id'];
      this.paymentId = params['pid'];
      this.salesTransactionId = params['stid'];
      this.saleId = params['saleId'];
      this.context = params['context'];
      this.previousTabIndex = params['previousTab'] || 0;
    });
  }

  ngOnInit() {
    this.updateForm = new FormGroup({
      paymentFormControl: new FormControl('', Validators.required),
      salesTransactionFormControl: new FormControl('', Validators.required),
      dateFormControl: new FormControl({value: '', disabled: false}),
      totalPaymentFormControl: new FormControl({value: '', disabled: true}),
      consumedFormControl: new FormControl({value: '', disabled: true}),
      totalSalesTransactionFormControl: new FormControl({value: '', disabled: true}),
      payedSalesTransactionFormControl: new FormControl({value: '', disabled: true}),
      consumedTempFormControl: new FormControl({value: '', disabled: true}),
      payedFormControl: new FormControl({value: '', disabled: true}),
      typeFormControl: new FormControl({value: '', disabled: true}),
      valueFormControl: new FormControl('', Validators.required)
    });
    if (this.router.url.indexOf('salesTransactionPayment') > 0)
      if (this.saleId)
        this.fromSale = true;
      else
        this.fromSalesTransaction = true;
    else if (this.router.url.indexOf('paymentSalesTransaction') > 0)
      this.fromPayment = true;
    if (this.fromPayment)
      this.updateForm.controls["paymentFormControl"].disable();
    else
      this.updateForm.controls["salesTransactionFormControl"].disable();
    this.salesTransactionPayment.date = new Date();
    if (this.salesTransactionPaymentId)
      forkJoin(
        this.salesTransactionPaymentService.getOne(this.salesTransactionPaymentId),
        this.genericService.find('paymentType', {where: {merchantPayment: true}, sort: {order: 'asc'}}),
        this.genericService.find('paymentInfo', {where: {reference: 'PAYED'}}),
        this.genericService.find('consumptionInfo', {where: {reference: 'CONSUMED'}})
      ).subscribe(([response1, response2, response3, response4]: Array<any>) => {
        this.salesTransactionPayment = response1.data;
        this.paymentTypes = response2.data;
        this.payedPaymentInfo = response3.data ? response3.data[0] : undefined;
        this.consumedConsumptionInfo = response4.data ? response4.data[0] : undefined;
        this.salesTransactionPaymentBeforeEdition = JSON.parse(JSON.stringify(this.salesTransactionPayment));
        this.setSelectedPayment(this.salesTransactionPayment.payment);
        this.setSelectedSalesTransaction(this.salesTransactionPayment.salesTransaction);
        this.setSelectedPaymentType(null, this.salesTransactionPayment.paymentTypeId);
      });
    else if (this.paymentId)
      forkJoin(
        this.paymentService.getOne(this.paymentId),
        this.genericService.find('paymentType', {where: {merchantPayment: true}, sort: {order: 'asc'}}),
        this.genericService.find('paymentInfo', {where: {reference: 'PAYED'}}),
        this.genericService.find('consumptionInfo', {where: {reference: 'CONSUMED'}})
      ).subscribe(([response1, response2, response3, response4]: Array<any>) => {
        this.paymentTypes = response2.data;
        this.setSelectedPayment(response1.data);
        this.setSelectedPaymentType(null, this.selectedPayment.paymentTypeId);
        this.payedPaymentInfo = response3.data ? response3.data[0] : undefined;
        this.consumedConsumptionInfo = response4.data ? response4.data[0] : undefined;
      });
    else if (this.salesTransactionId)
      forkJoin(
        this.salesTransactionService.getOne(this.salesTransactionId),
        this.genericService.find('paymentType', {where: {merchantPayment: true}, sort: {order: 'asc'}}),
        this.genericService.find('paymentInfo', {where: {reference: 'PAYED'}}),
        this.genericService.find('consumptionInfo', {where: {reference: 'CONSUMED'}})
      ).subscribe(([response1, response2, response3, response4]: Array<any>) => {
        this.setSelectedSalesTransaction(response1.data);
        this.paymentTypes = response2.data;
        this.payedPaymentInfo = response3.data ? response3.data[0] : undefined;
        this.consumedConsumptionInfo = response4.data ? response4.data[0] : undefined;
      });
  }

  public save() {
    this.updateForm.controls['valueFormControl'].setErrors(null);
    delete this.salesTransactionPayment.paymentType;
    delete this.salesTransactionPayment.payment;
    delete this.salesTransactionPayment.salesTransaction;
    let query;
    if (this.salesTransactionPaymentId)
      query = this.salesTransactionPaymentService.update(this.salesTransactionPayment);
    else
      query = this.salesTransactionPaymentService.create(this.salesTransactionPayment);
    query.subscribe((response: any) => {
      this.goBack();
    }, (response: any) => {
      let msg;
      if (response.error.err === "#BUSINESS_ERROR")
        msg = response.error.msg;
      else
        msg = "Une erreur inattendue est survenue!";
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
                 // this.deliveryBillPaymentForm.controls.valueControl.setErrors({error: response.error});
    });
  }

  public searchPayments(event: any = null, id = null) {
    let value = this.tappedPaymentName;
    this.consumedPayment = null;
    let criteria: any = {limit: 5, hideSpinner: true};
    if (id !== null) {
      criteria.where = {id: id};
    } else {
      criteria.where = {name: {'like': '%' + value + '%'}};
    }
    criteria.where.isCommissionnaryPayment = false;
    if (this.consumedConsumptionInfo)
      criteria.where.consumptionInfoId = {'!=': this.consumedConsumptionInfo.id};
    this.paymentService.find(criteria).subscribe((response: any) => {
      this.payments = response.data;
      if (id !== null) {
        this.setSelectedPayment(response.data[0]);
      }
    });
  }

  public setSelectedPayment(payment: any) {
    this.selectedPayment = payment;
    setTimeout(() => this.tappedPaymentName = payment.name);
    this.paymentId = payment.id;
    this.salesTransactionPayment.paymentId = this.paymentId;
    this.consumedPayment = this.selectedPayment.consumed || 0;
    this.setSelectedPaymentType(null, this.selectedPayment.paymentTypeId);
  }

  public searchSalesTransactions(event: any = null, id = null) {
    let value = this.tappedSalesTransactionName;
    let criteria: any = {limit: 5, hideSpinner: true};
    if (id !== null) {
      criteria.where = {id: id};
    } else {
      criteria.where = {name: {'like': '%' + value + '%'}};
    }
    if (this.payedPaymentInfo)
      criteria.where.paymentInfoId = {'!=': this.payedPaymentInfo.id};
    this.salesTransactionService.find(criteria).subscribe((response: any) => {
      this.salesTransactions = response.data;
      if (id !== null) {
        this.setSelectedSalesTransaction(response.data[0]);
      }
    });
  }

  public setSelectedSalesTransaction(salesTransaction: any) {
    this.selectedSalesTransaction = salesTransaction;
    setTimeout(() => this.tappedSalesTransactionName = salesTransaction.name);
    this.salesTransactionId = salesTransaction.id;
    this.salesTransactionPayment.salesTransactionId = this.salesTransactionId;
    this.payedDelivery = this.selectedSalesTransaction.totalMerchantPayment || 0;
  }

  public setSelectedPaymentType(event: any, id = null) {
    if (id)
      this.salesTransactionPayment.paymentType = _.find(this.paymentTypes, {id: id});
    else
      this.salesTransactionPayment.paymentType = _.find(this.paymentTypes, {id: event.value});
    this.salesTransactionPayment.paymentTypeId = this.salesTransactionPayment.paymentType.id;
  }

  isValidForm() {
    return this.updateForm.valid;
  }

  goBack() {
    if (this.fromSale)
      this.router.navigate(['/ui-components/salesTransaction/edit', this.salesTransactionId, this.saleId, this.previousTabIndex]);
    else if (this.fromPayment)
      this.router.navigate(['/ui-components/payment/edit', this.paymentId, this.context, this.previousTabIndex]);
    else if (this.fromSalesTransaction)
      this.router.navigate(['/ui-components/salesTransaction/view', this.salesTransactionId, this.previousTabIndex]);
  }

  public calculate() {
    this.updateForm.controls['valueFormControl'].setErrors(null);
    let isError = false;
    if (this.selectedPayment) {
      let consumed = this.selectedPayment.consumed || 0;
      if (this.salesTransactionPaymentBeforeEdition
        && this.salesTransactionPaymentBeforeEdition.paymentId === this.selectedPayment.id) {
        consumed -= this.salesTransactionPaymentBeforeEdition.value;
      }
      consumed += this.salesTransactionPayment.value || 0;
      consumed=Number(parseFloat(consumed).toFixed(3));
      this.consumedPayment = consumed;
      if (consumed > this.selectedPayment.value) {
        this.updateForm.controls['valueFormControl'].setErrors(
          {error: 'La somme des règlements sur livraisons dépasse le montant total du réglement'})
        isError = true;
      }
    }
    if (this.selectedSalesTransaction) {
      let payed = this.selectedSalesTransaction.totalMerchantPayment || 0;
      if (this.salesTransactionPaymentId) {
        payed -= this.salesTransactionPaymentBeforeEdition.value;
      }
      payed += this.salesTransactionPayment.value || 0;
      payed=Number(parseFloat(payed).toFixed(3));
      this.payedDelivery = payed;
      if (!isError && this.payedDelivery > this.selectedSalesTransaction.totalToPayByMerchant) {
        this.updateForm.controls['valueFormControl'].setErrors(
          {error: 'La somme des règlements livraison dépasse le montant total de la livraison'})
      }
    }
  }

  public showProvisional() {
    return (
      (!this.salesTransactionPaymentBeforeEdition && this.salesTransactionPayment.value)
      ||
      (this.salesTransactionPaymentBeforeEdition && (
          (this.salesTransactionPaymentBeforeEdition.value !== this.salesTransactionPayment.value)
          ||
          (this.salesTransactionPaymentBeforeEdition.paymentId !== this.salesTransactionPayment.paymentId)
          ||
          (this.salesTransactionPaymentBeforeEdition.salesTransactionId !== this.salesTransactionPayment.salesTransactionId)
        )
      )
    );
  }
}
