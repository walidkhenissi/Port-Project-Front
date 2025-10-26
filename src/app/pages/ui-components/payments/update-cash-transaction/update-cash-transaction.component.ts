import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import 'lodash';
import {GenericService} from "../../../../services/generic.service";
import {forkJoin} from "rxjs";
import {CashTransactionService} from "../../../../services/cash-transaction.service";
import {ShipownersService} from "../../../../services/shipowner.service";
import * as moment from 'moment';

declare var _: any;

@Component({
  selector: 'app-update-cash-transaction',
  templateUrl: './update-cash-transaction.component.html',
  styleUrls: ['./update-cash-transaction.component.scss']
})
export class UpdateCashTransactionComponent implements OnInit {
  transactionId: number;
  updateForm: FormGroup;
  transactionAccounts: Array<any>;
  transaction: any = new Object();
  isByAddress = false;
  selectedCashAccount: any = new Object();

  constructor(
    private route: ActivatedRoute,
    private cashTransactionService: CashTransactionService,
    private shipownerService: ShipownersService,
    private genericService: GenericService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.route.params.subscribe((params) => {
      this.transactionId = params['id'];
    });
  }

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      accountFormControl: new FormControl('', Validators.required),
      dateFormControl: new FormControl('', Validators.required),
      labelFormControl: new FormControl(""),
      creditValueFormControl: new FormControl('', [Validators.min(0), Validators.required]),
      debitValueFormControl: new FormControl('', [Validators.min(0), Validators.required]),
      noteFormControl: new FormControl(''),
      producerFormControl: new FormControl('')
    });
    if (this.transactionId) {
      forkJoin(
        this.cashTransactionService.getOne(this.transactionId),
        this.genericService.find('cashAccount', {where: {userTransaction: true}})
      ).subscribe(([response1, response2]: Array<any>) => {
        this.transaction = response1.data;
        this.transactionAccounts = response2.data;
        this.setSelectedAccount(null, this.transaction.accountId);
        if (this.selectedCashAccount.byAddress) {
          let producerId = this.transaction.shipOwnerId || this.transaction.merchantId;
          if (producerId)
            this.searchProducers(null, producerId);
        }
      });
    } else {
      this.transaction.date = new Date();
      this.transaction.credit = 0;
      this.transaction.debit = 0;
      this.transaction.isCommissionnary = true;
      this.genericService.find('cashAccount', {where: {userTransaction: true}}).subscribe((response: any) => {
        this.transactionAccounts = response.data;
      });
    }
  }

  addTransaction() {
    let account = _.find(this.transactionAccounts, {id: this.transaction.accountId});
    if (account)
      this.transaction.name = account.name.concat('_').concat(this.transaction.name);
    this.cashTransactionService.create(this.transaction)
      .subscribe(
        (response: any) => {
          this.router.navigate(['/ui-components/cashTransaction']);
        },
        // Managing Get_User errors
        error => {
          console.log(error);
        });
  }

  updateTransaction(): void {
    this.cashTransactionService.update(this.transaction).subscribe(
      (result: any) => {
        if (result.error) {
          console.error('Error updating cashTransaction:', result.error);
        } else {
          console.log('CashTransaction updated successfully');
          this.router.navigate(['/ui-components/cashTransaction']);
        }
      },
      (error) => {
        console.error('Error updating cashTransaction:', error);
        // Handle errors or show error messages
      }
    );
  }

  public verifyCreditAmount() {
    this.updateForm.controls['creditValueFormControl'].setErrors(null);
    if (this.transaction.credit && this.transaction.credit < 0)
      this.updateForm.controls['creditValueFormControl'].setErrors({error: 'Le montant ne peut pas être négatif!'});
  }

  public verifyDebitAmount() {
    this.updateForm.controls['debitValueFormControl'].setErrors(null);
    if (this.transaction.debit && this.transaction.debit < 0)
      this.updateForm.controls['debitValueFormControl'].setErrors({error: 'Le montant ne peut pas être négatif!'});
  }

  isValidForm() {
    return this.updateForm.valid;
  }

  public setSelectedAccount(event: any, id = null) {
    if (id)
      this.selectedCashAccount = _.find(this.transactionAccounts, {id: id});
    else
      this.selectedCashAccount = _.find(this.transactionAccounts, {id: event.value});
    this.isByAddress = this.selectedCashAccount.byAddress;
    this.transaction.accountId = this.selectedCashAccount.id;
    if (this.isByAddress) {
      this.updateForm.controls['producerFormControl'].addValidators(Validators.required);
      this.updateForm.controls['labelFormControl'].clearValidators();
    } else {
      delete this.transaction.shipOwnerId;
      delete this.transaction.merchantId;
      this.updateForm.controls['labelFormControl'].addValidators(Validators.required);
      this.updateForm.controls['producerFormControl'].clearValidators();
    }
  }

  public tappedProducerName: string;
  public selectedProducer: any;
  public producers: any;

  public searchProducers(event: any = null, id = null) {
    if (event && event.key === 'Enter')
      return;
    let value = this.tappedProducerName;
    let criteria: any = {limit: 5, hideSpinner: true};
    if (id !== null) {
      criteria.where = {id: id};
    } else {
      criteria.where = {name: {'like': '%' + value + '%'}};
    }
    this.shipownerService.findProducer(criteria).subscribe((response: any) => {
      this.producers = response.data;
      this.producers.sort(function (producer1: any, producer2: any) {
        return producer1.name.localeCompare(producer2.name);
      });
      if (id !== null) {
        this.setSelectedProducer(response.data[0]);
      }
    });
  }

  public setSelectedProducer(producer: any) {
    this.selectedProducer = producer;
    this.tappedProducerName = producer.lastName + ' ' + producer.firstName + (producer.isShipOwner ? ' (Armateur)' : ' (Commerçant)');
    this.transaction.merchantId = null;
    this.transaction.shipOwnerId = null;
    if (producer.isShipOwner) {
      this.transaction.shipOwnerId = this.selectedProducer.id;
    } else {
      this.transaction.merchantId = this.selectedProducer.id;
    }
    this.transaction.name = producer.lastName + ' ' + producer.firstName;
    if (this.selectedCashAccount)
      this.transaction.name = this.transaction.name.concat('-').concat(this.selectedCashAccount.name);
    this.transaction.name = this.transaction.name.concat('-').concat(moment(this.transaction.date).format('DD-MM-YYYY')).concat('-').concat(this.transaction.credit || this.transaction.debit).concat('Dt');
  }

}
