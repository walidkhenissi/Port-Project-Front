import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MerchantsService} from 'src/app/services/merchant.service';
import {GenericService} from "../../../../services/generic.service";
import {forkJoin} from 'rxjs';
import {CommissionService} from "../../../../services/commission.service";

@Component({
  selector: 'app-update.merchant',
  templateUrl: './update.merchant.component.html',
  styleUrls: ['./update.merchant.component.scss']
})
export class UpdateMerchantComponent implements OnInit {
  merchantId: number;
  updateForm: FormGroup;
  civilities: Array<any>;
  merchant: any = new Object();

  constructor(
    private route: ActivatedRoute,
    private merchantService: MerchantsService,
    private commissionService: CommissionService,
    private genericService: GenericService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.route.params.subscribe((params) => {
      this.merchantId = params['id'];
    });
    this.merchant.civility={};
    this.merchant.address={};
    this.merchant.enabled=true;
  }

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      civilityControl: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl("", Validators.required),
      socialReason: new FormControl(''),
      taxRegistrationNumber: new FormControl(''),
      phoneNumber: new FormControl(),
      enabled: new FormControl(true, Validators.required),
      addressStreet: new FormControl(""),
      addressCity: new FormControl('', Validators.required),
      addressPostalCode: new FormControl("")
    });
    if (this.merchantId) {
      forkJoin(
        this.merchantService.getOne(this.merchantId),
        this.genericService.find('Civility'),
        this.commissionService.list()
      ).subscribe(([response1, response2, response3]: Array<any>) => {
        this.merchant = response1.data;
        this.merchant.civility = this.merchant.civility || {};
        this.merchant.address = this.merchant.address || {};
        this.civilities = response2.data;
        console.log(response3);
      });
    } else {
      this.merchant.civility = {};
      this.merchant.address = {};
      this.genericService.find('Civility').subscribe((response: any) => {
        this.civilities = response.data;
      });
    }
  }

  addMerchant() {
    console.log(this.merchant)
    this.merchantService.create(this.merchant)
      .subscribe(
        (response: any) => {
          this.router.navigate(['/ui-components/merchant-management']);
        },
        // Managing Get_User errors
        error => {
          console.log(error);
        });
  }

  updateMerchant(): void {
    this.merchantService.update(this.merchant).subscribe(
      (result: any) => {
        if (result.error) {
          console.error('Error updating shipowner:', result.error);
        } else {
          console.log('Merchant and associated address updated successfully');
          this.router.navigate(['/ui-components/merchant-management']);
        }
      },
      (error) => {
        console.error('Error updating merchant:', error);
        // Handle errors or show error messages
      }
    );
  }

  toggleAnabled(checked: boolean) {
    this.merchant.enabled = checked;
  }

  isValidForm(){
    return this.updateForm.valid;
  }
}
