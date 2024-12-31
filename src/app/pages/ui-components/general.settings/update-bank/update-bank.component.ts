import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ArticleService} from "../../../../services/article.service";
import {GenericService} from "../../../../services/generic.service";
import {GridsStateService} from "../../../../services/grids-state.service";
import {MatDialog} from "@angular/material/dialog";
import {BankService} from "../../../../services/bank.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-update-bank',
  templateUrl: './update-bank.component.html',
  styleUrls: ['./update-bank.component.scss']
})
export class UpdateBankComponent {

  bankId: number;
  tab: number;
  updateForm: FormGroup;
  bank: any = new Object();

  constructor(
    private route: ActivatedRoute,
    private bankService: BankService,
    private genericService: GenericService,
    private gridsStateService: GridsStateService,
    private router: Router,
    private dialog: MatDialog) {
    this.route.params.subscribe((params) => {
      this.bankId = params['id'];
      this.tab = params['tab'];
    });
  }

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      bakNameFormControl: new FormControl('', Validators.required),
    });
    if (this.bankId)
      this.bankService.getOne(this.bankId).subscribe((response: any) => {
        this.bank = response.data;
      });
  }

  save() {
    let request: Observable<any>;
    if (this.bankId)
      request = this.bankService.update(this.bank);
    else
      request = this.bankService.create(this.bank);
    request.subscribe((response: any) => {
        this.goBack();
      },
      // Managing Get_User errors
      (response: any) => {
        console.log(response);
      });
  }

  goBack() {
    this.router.navigate(['/ui-components/general-settings', this.tab]);
  }

  isValidForm() {
    return this.updateForm.valid;
  }
}
