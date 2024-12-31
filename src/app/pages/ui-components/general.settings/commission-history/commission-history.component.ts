import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CommissionService} from "../../../../services/commission.service";
import {CommissionHistoryService} from "../../../../services/commission-history.service";
import {GenericService} from "../../../../services/generic.service";
import {GridsStateService} from "../../../../services/grids-state.service";
import {MatDialog} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-commission-history',
  templateUrl: './commission-history.component.html',
  styleUrls: ['./commission-history.component.scss']
})
export class CommissionHistoryComponent {

  commissionHistoryId: number;
  commissionId: number;
  commissionHistory: any = new Object();
  commission: any = new Object();
  updateForm: FormGroup;
  tab: number;

  constructor(
    private route: ActivatedRoute,
    private commissionHistoryService: CommissionHistoryService,
    private commissionService: CommissionService,
    private genericService: GenericService,
    private gridsStateService: GridsStateService,
    private router: Router,
    private dialog: MatDialog) {
    this.route.params.subscribe((params) => {
      this.commissionHistoryId = params['id'];
      this.commissionId = params['commissionId'];
      this.tab = params['tab'];
    });
  }

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      commissionHistoryValueFormControl: new FormControl('', Validators.compose([Validators.required, this.notAllowed(/^[0.0]+$/), Validators.min(0)])),
      startDateFormControl: new FormControl('', Validators.required),
      endDateFormControl: new FormControl(''),
      isSellerFormControl: new FormControl(''),
      isCustomerFormControl: new FormControl(''),
      isPercentFormControl: new FormControl(''),
      isPerUnitFormControl: new FormControl('')
    });
    if (this.commissionHistoryId)
      this.commissionHistoryService.getOne(this.commissionHistoryId).subscribe((response: any) => {
        this.commissionHistory = response.data;
        this.commission = this.commissionHistory.Commission;
        if (this.commissionHistory.endDate)
          this.disableAll();
      });
    else
      this.commissionService.getOne(this.commissionId).subscribe((response: any) => {
        this.commission = response.data;
        this.commissionHistory.isSellerCommission = true;
        this.commissionHistory.commissionId = this.commissionId;
        this.updateForm.controls['endDateFormControl'].disable();
      });
  }

  public disableAll() {
    for (let control in this.updateForm.controls)
      if (!this.updateForm.controls[control].disabled)
        this.updateForm.controls[control].disable();
  }

  notAllowed(input: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = input.test(control.value);
      return forbidden ? {notAllowed: {value: control.value}} : null;
    };
  }

  save(confirm: boolean) {
    if (confirm === false && !this.commissionHistoryId) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: "L'ajout d'une nouvelle valeur de commission va clôturer automatiquement l'application de l'ancienne valeur. Etes-vous sûr de vouloir continuer ?",
          title: 'Attention!',
          confirm: () => this.save(true),
          reject: () => {
          }
        }
      });
      return;
    } else if (confirm === false && this.commissionHistoryId && this.commissionHistory.endDate) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: "Vous êtes sur le point de clôturer l'application de cette valeur. Etes-vous sûr de vouloir continuer ?",
          title: 'Attention!',
          confirm: () => this.save(true),
          reject: () => {
          }
        }
      });
      return;
    }
    let request: Observable<any>;
    if (this.commissionHistoryId)
      request = this.commissionHistoryService.update(this.commissionHistory);
    else
      request = this.commissionHistoryService.create(this.commissionHistory);
    request.subscribe((response: any) => {
        this.goBack();
      },
      // Managing Get_User errors
      (response: any) => {
        let msg = '!';
        if (response.error.error.errorCode === "#INTERNAL_ERROR")
          msg = 'Impossible le continuer! Une erreure interne est survenue.';
        if (response.error.error.errorCode === "#DATE_CREDENTIAL_ERROR")
          msg = 'Impossible le continuer! Veuillez vérifier la date saisie.';
        else if (response.error.error.errorCode === "#DATA_CREDENTIAL_ERROR")
          msg = 'Impossible le continuer! Veuillez vérifier les données saisie.';
        else if (response.error.error.errorCode === "#DATE_CONSTRAINT_ERROR") {
          msg = "Impossible de continuer. Veuillez vérifier les données saisies. La date de clôture est antérieure à une ou plusieurs vente(s) qui utilise cette valeur de commission!";
        }
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

  goBack() {
    this.router.navigate(['/ui-components/commission/edit', this.commissionId, this.tab]);
  }

  isValidForm() {
    return this.updateForm.valid && (this.commissionHistory.isSellerCommission || this.commissionHistory.isCustomerCommission);
  }

  togglePayer(checked: boolean, isSellerCommission: boolean) {
    this.commissionHistory.isSellerCommission = isSellerCommission ? checked : !checked;
    this.commissionHistory.isCustomerCommission = !this.commissionHistory.isSellerCommission;
  }

  toggleCommissionType(checked: boolean, isPercentValue: boolean) {
    this.commissionHistory.isPercentValue = isPercentValue ? checked : !checked;
    this.commissionHistory.isPerUnitValue = !this.commissionHistory.isPercentValue;
  }
}
