import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CommissionHistoryService} from "../../../../services/commission-history.service";
import {CommissionService} from "../../../../services/commission.service";
import {GenericService} from "../../../../services/generic.service";
import {GridsStateService} from "../../../../services/grids-state.service";
import {MatDialog} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CommissionBeneficiaryService} from "../../../../services/commission-beneficiary.service";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";
import {forkJoin, Observable} from "rxjs";
import {BeneficiaryService} from "../../../../services/beneficiary.service";

@Component({
  selector: 'app-update-beneficiary',
  templateUrl: './update-beneficiary.component.html',
  styleUrls: ['./update-beneficiary.component.scss']
})
export class UpdateBeneficiaryComponent {

  beneficiaryId: number;
  tab: number;
  updateForm: FormGroup;
  beneficiary: any = new Object();

  constructor(
    private route: ActivatedRoute,
    private beneficiaryService: BeneficiaryService,
    private genericService: GenericService,
    private gridsStateService: GridsStateService,
    private router: Router,
    private dialog: MatDialog) {
    this.route.params.subscribe((params) => {
      this.beneficiaryId = params['id'];
      this.tab = params['tab'];
    });
  }

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      beneficiaryNameFormControl: new FormControl('', Validators.required),
    });
    if (this.beneficiaryId)
      this.beneficiaryService.getOne(this.beneficiaryId).subscribe((response: any) => {
        this.beneficiary = response.data;
      });
  }

  save() {
    let request: Observable<any>;
    if (this.beneficiaryId)
      request = this.beneficiaryService.update(this.beneficiary);
    else
      request = this.beneficiaryService.create(this.beneficiary);
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
