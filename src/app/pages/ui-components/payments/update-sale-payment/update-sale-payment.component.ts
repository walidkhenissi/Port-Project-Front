import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {PaymentService} from "../../../../services/payment.service";
import {GenericService} from "../../../../services/generic.service";
import {forkJoin} from "rxjs";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";
import {SalePaymentService} from "../../../../services/sale-payment.service";
import {SaleService} from "../../../../services/sale.service";
import 'lodash';

declare var _: any;

@Component({
  selector: 'app-update-sale-payment',
  templateUrl: './update-sale-payment.component.html',
  styleUrls: ['./update-sale-payment.component.scss']
})
export class UpdateSalePaymentComponent {

  salePaymentId: number;
  salePayment: any = new Object();
  salePaymentBeforeEdition: any = null;
  paymentId: number;
  saleId: number;
  payments: any = [];
  selectedPayment: any = new Object();
  tappedPaymentName: string;
  sales: any = [];
  selectedSale: any = new Object();
  tappedSaleName: string;
  previousTabIndex: number = 0;
  paymentTypes: any = [];
  public updateForm: FormGroup;
  fromPayment = false;
  fromSale = false;
  context: number;
  consumedPayment: any = null;
  payedDelivery: any = null;
  payedPaymentInfo: any = new Object();
  consumedConsumptionInfo: any = new Object();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private paymentService: PaymentService,
              private salePaymentService: SalePaymentService,
              private saleService: SaleService,
              private genericService: GenericService) {
    this.route.params.subscribe(params => {
      this.salePaymentId = params['id'];
      this.paymentId = params['pid'];
      this.saleId = params['stid'];
      this.saleId = params['saleId'];
      this.context = params['context'];
      this.previousTabIndex = params['previousTab'] || 0;
    });
  }

  ngOnInit() {
    this.updateForm = new FormGroup({
      paymentFormControl: new FormControl('', Validators.required),
      saleFormControl: new FormControl('', Validators.required),
      dateFormControl: new FormControl({value: '', disabled: false}),
      totalPaymentFormControl: new FormControl({value: '', disabled: true}),
      consumedFormControl: new FormControl({value: '', disabled: true}),
      totalSaleFormControl: new FormControl({value: '', disabled: true}),
      payedSaleFormControl: new FormControl({value: '', disabled: true}),
      consumedTempFormControl: new FormControl({value: '', disabled: true}),
      payedFormControl: new FormControl({value: '', disabled: true}),
      typeFormControl: new FormControl({value: '', disabled: true}),
      valueFormControl: new FormControl('', Validators.required)
    });
    if (this.router.url.indexOf('paymentSaleFromSale') > 0)
      this.fromSale = true;
    else if (this.router.url.indexOf('paymentSale') > 0)
      this.fromPayment = true;
    if (this.fromPayment)
      this.updateForm.controls["paymentFormControl"].disable();
    else
      this.updateForm.controls["saleFormControl"].disable();
    this.salePayment.date = new Date();
    if (this.salePaymentId)
      forkJoin(
        this.salePaymentService.getOne(this.salePaymentId),
        this.genericService.find('paymentType', {sort: {order: 'asc'}}),
        this.genericService.find('paymentInfo', {where: {reference: 'PAYED'}}),
        this.genericService.find('consumptionInfo', {where: {reference: 'CONSUMED'}})
      ).subscribe(([response1, response2, response3, response4]: Array<any>) => {
        this.salePayment = response1.data;
        this.filterPaymentTypes(response2.data, this.salePayment.payment.isCommissionnaryPayment);
        this.payedPaymentInfo = response3.data ? response3.data[0] : undefined;
        this.consumedConsumptionInfo = response4.data ? response4.data[0] : undefined;
        this.salePaymentBeforeEdition = JSON.parse(JSON.stringify(this.salePayment));
        this.setSelectedPayment(this.salePayment.payment);
        this.setSelectedSale(this.salePayment.sale);
        this.setSelectedPaymentType(null, this.salePayment.paymentTypeId);
      });
    else if (this.paymentId)
      forkJoin(
        this.paymentService.getOne(this.paymentId),
        this.genericService.find('paymentType', {sort: {order: 'asc'}}),
        this.genericService.find('paymentInfo', {where: {reference: 'PAYED'}}),
        this.genericService.find('consumptionInfo', {where: {reference: 'CONSUMED'}})
      ).subscribe(([response1, response2, response3, response4]: Array<any>) => {
        this.filterPaymentTypes(response2.data, response1.data.isCommissionnaryPayment);
        this.setSelectedPayment(response1.data);
        this.setSelectedPaymentType(null, this.selectedPayment.paymentTypeId);
        this.payedPaymentInfo = response3.data ? response3.data[0] : undefined;
        this.consumedConsumptionInfo = response4.data ? response4.data[0] : undefined;
      });
    else if (this.saleId)
      forkJoin(
        this.saleService.getOne(this.saleId),
        this.genericService.find('paymentType', {where: {merchantPayment: true}, sort: {order: 'asc'}}),
        this.genericService.find('paymentInfo', {where: {reference: 'PAYED'}}),
        this.genericService.find('consumptionInfo', {where: {reference: 'CONSUMED'}})
      ).subscribe(([response1, response2, response3, response4]: Array<any>) => {
        this.setSelectedSale(response1.data);
        this.filterPaymentTypes(response2.data, true);
        this.payedPaymentInfo = response3.data ? response3.data[0] : undefined;
        this.consumedConsumptionInfo = response4.data ? response4.data[0] : undefined;
      });
  }

  private filterPaymentTypes(paymentTypes: any, isCommissionnaryPayment: boolean = false) {
    if (isCommissionnaryPayment) {
      this.paymentTypes = _.filter(paymentTypes, function (paymentType: any) {
        return paymentType.commissionnaryPayment;
      });
    } else {
      this.paymentTypes = _.filter(paymentTypes, function (paymentType: any) {
        return paymentType.merchantPayment;
      });
    }
  }

  public save() {
    this.updateForm.controls['valueFormControl'].setErrors(null);
    delete this.salePayment.paymentType;
    delete this.salePayment.payment;
    delete this.salePayment.sale;
    let query;
    if (this.salePaymentId)
      query = this.salePaymentService.update(this.salePayment);
    else
      query = this.salePaymentService.create(this.salePayment);
    query.subscribe((response: any) => {
      this.goBack();
    }, (response: any) => {
      let msg = '!';
      msg = response.error.msg;
      if (response.error.error.error)
        msg = response.error.error.error;
      else if (response.error.error.errorCode === "#INTERNAL_ERROR")
        msg = 'Impossible le continuer! Une erreure interne est survenue.';
      else if (response.error.error.errorCode === "#EXCEED_PAYMENT_VALUE")
        msg = 'Impossible le continuer! Le total des paiements affectés dépasse la valeur de la vente!';
      if (msg)
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
      // criteria.where = {id: id};
      criteria.id=id;
    } else {
      // criteria.where = {name: {'like': '%' + value + '%'}};
      criteria.name=value;
    }
    // criteria.where.isCommissionnaryPayment = true;
    criteria.isCommissionnaryPayment=true;
    if (this.consumedConsumptionInfo) {
      // criteria.where.consumptionInfoId = {'!=': this.consumedConsumptionInfo.id};
      criteria.consumptionInfoId=this.consumedConsumptionInfo.id;
    }
    if (this.selectedSale && this.selectedSale.shipOwnerId)
      criteria.shipOwnerId = this.selectedSale.shipOwnerId;
    this.paymentService.findWithAddressCondition(criteria).subscribe((response: any) => {
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
    this.salePayment.paymentId = this.paymentId;
    this.consumedPayment = this.selectedPayment.consumed || 0;
    this.setSelectedPaymentType(null, this.selectedPayment.paymentTypeId);
  }

  public searchSales(event: any = null, id = null) {
    let value = this.tappedSaleName;
    let criteria: any = {limit: 5, hideSpinner: true};
    if (id !== null) {
      criteria.where = {id: id};
    } else {
      criteria.where = {name: {'like': '%' + value + '%'}};
    }
    if (this.payedPaymentInfo)
      criteria.where.paymentInfoId = {'!=': this.payedPaymentInfo.id};
    if(this.selectedPayment.paymentType && this.selectedPayment.paymentType.byAddress){
      if(this.selectedPayment.shipOwnerId)
        criteria.where.shipOwnerId = this.selectedPayment.shipOwnerId;
      else if(this.selectedPayment.merchantId)
        criteria.where.merchantId = this.selectedPayment.merchantId;
    }
    this.saleService.find(criteria).subscribe((response: any) => {
      this.sales = response.data;
      if (id !== null) {
        this.setSelectedSale(response.data[0]);
      }
    });
  }

  public setSelectedSale(sale: any) {
    this.selectedSale = sale;
    setTimeout(() => this.tappedSaleName = sale.name);
    this.saleId = sale.id;
    this.salePayment.saleId = this.saleId;
    this.payedDelivery = this.selectedSale.totalToPay || 0;
  }

  public setSelectedPaymentType(event: any, id = null) {
    if (id)
      this.salePayment.paymentType = _.find(this.paymentTypes, {id: id});
    else
      this.salePayment.paymentType = _.find(this.paymentTypes, {id: event.value});
    this.salePayment.paymentTypeId = this.salePayment.paymentType.id;
  }

  isValidForm() {
    return this.updateForm.valid;
  }

  goBack() {
    if (this.fromSale)
      this.router.navigate(['/ui-components/sales/edit', this.saleId, this.previousTabIndex]);
    else if (this.fromPayment)
      this.router.navigate(['/ui-components/payment/edit', this.paymentId, this.context, this.previousTabIndex]);
  }

  public calculate() {
    this.updateForm.controls['valueFormControl'].setErrors(null);
    let isError = false;
    if (this.selectedPayment) {
      let consumed = this.selectedPayment.consumed || 0;
      if (this.salePaymentBeforeEdition
        && this.salePaymentBeforeEdition.paymentId === this.selectedPayment.id) {
        consumed -= this.salePaymentBeforeEdition.value;
      }
      consumed += this.salePayment.value || 0;
      consumed = Number(parseFloat(consumed).toFixed(3));
      this.consumedPayment = consumed;
      if (consumed > this.selectedPayment.value) {
        this.updateForm.controls['valueFormControl'].setErrors(
          {error: 'La somme des règlements sur ventes dépasse le montant total du réglement'})
        isError = true;
      }
    }
    if (this.selectedSale) {
      let payed = this.selectedSale.totalPaid || 0;
      if (this.salePaymentId) {
        payed -= this.salePaymentBeforeEdition.value;
      }
      payed += this.salePayment.value || 0;
      payed = Number(parseFloat(payed).toFixed(3));
      this.payedDelivery = payed;
      if (!isError && this.payedDelivery > this.selectedSale.totalToPay) {
        this.updateForm.controls['valueFormControl'].setErrors(
          {error: 'La somme des règlements vente dépasse le montant total de la vente'})
      }
    }
  }

  public showProvisional() {
    return (
      (!this.salePaymentBeforeEdition && this.salePayment.value)
      ||
      (this.salePaymentBeforeEdition && (
          (this.salePaymentBeforeEdition.value !== this.salePayment.value)
          ||
          (this.salePaymentBeforeEdition.paymentId !== this.salePayment.paymentId)
          ||
          (this.salePaymentBeforeEdition.saleId !== this.salePayment.saleId)
        )
      )
    );
  }
}
