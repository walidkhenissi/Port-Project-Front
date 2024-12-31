import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import 'lodash';
import {GenericService} from "../../../../services/generic.service";
import {forkJoin} from "rxjs";
import {CashTransactionService} from "../../../../services/cash-transaction.service";

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

  constructor(
    private route: ActivatedRoute,
    private cashTransactionService: CashTransactionService,
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
      labelFormControl: new FormControl("", Validators.required),
      creditValueFormControl: new FormControl('', [Validators.min(0), Validators.required]),
      debitValueFormControl: new FormControl('', [Validators.min(0), Validators.required]),
      noteFormControl: new FormControl('')
    });
    if (this.transactionId) {
      forkJoin(
        this.cashTransactionService.getOne(this.transactionId),
        this.genericService.find('cashAccount', {where: {userTransaction: true}})
      ).subscribe(([response1, response2]: Array<any>) => {
        this.transaction = response1.data;
        this.transactionAccounts = response2.data;
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

}
