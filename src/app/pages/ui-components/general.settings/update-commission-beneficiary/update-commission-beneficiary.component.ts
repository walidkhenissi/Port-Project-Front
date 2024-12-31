import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {CommissionBeneficiaryService} from "../../../../services/commission-beneficiary.service";
import {CommissionService} from "../../../../services/commission.service";
import {GenericService} from "../../../../services/generic.service";
import {GridsStateService} from "../../../../services/grids-state.service";
import {MatDialog} from "@angular/material/dialog";
import {forkJoin, Observable} from "rxjs";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-update-commission-beneficiary',
  templateUrl: './update-commission-beneficiary.component.html',
  styleUrls: ['./update-commission-beneficiary.component.scss']
})
export class UpdateCommissionBeneficiaryComponent {

  commissionBeneficiaryId: number;
  commissionId: number;
  tab: number;
  updateForm: FormGroup;
  commissionBeneficiary: any = new Object();
  commission: any = new Object();
  beneficiaries: Array<any> = [];

  constructor(
    private route: ActivatedRoute,
    private commissionBeneficiaryService: CommissionBeneficiaryService,
    private commissionService: CommissionService,
    private genericService: GenericService,
    private gridsStateService: GridsStateService,
    private router: Router,
    private dialog: MatDialog) {
    this.route.params.subscribe((params) => {
      this.commissionBeneficiaryId = params['id'];
      this.commissionId = params['commissionId'];
      this.tab = params['tab'];
    });
  }

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      startDateFormControl: new FormControl('', Validators.required),
      endDateFormControl: new FormControl(''),
      commissionFormControl: new FormControl(''),
      beneficiaryFormControl: new FormControl('', Validators.required)
    });
    if (this.commissionBeneficiaryId)
      forkJoin(
        this.commissionBeneficiaryService.getOne(this.commissionBeneficiaryId),
        this.genericService.find('beneficiary')
      ).subscribe(([response1, response2]: Array<any>) => {
        this.commissionBeneficiary = response1.data;
        this.beneficiaries = response2.data;
        this.commission = this.commissionBeneficiary.Commission;
        if (this.commissionBeneficiary.endDate)
          this.disableAll();
      });
    else
      forkJoin(
        this.commissionService.getOne(this.commissionId),
        this.genericService.find('beneficiary')
      ).subscribe(([response1, response2]: Array<any>) => {
        this.commission = response1.data;
        this.beneficiaries = response2.data;
        this.commissionBeneficiary.commissionId = this.commissionId;
        this.updateForm.controls['endDateFormControl'].disable();
      });
  }

  public disableAll() {
    for (let control in this.updateForm.controls)
      if (!this.updateForm.controls[control].disabled)
        this.updateForm.controls[control].disable();
  }

  save(confirm: boolean) {
    if (confirm === false && !this.commissionBeneficiaryId) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: "L'ajout d'un nouvel bénéficière de commission va suspendre automatiquement l'ancienne bénéficiaire. Etes-vous sûr de vouloir continuer ?",
          title: 'Attention!',
          confirm: () => this.save(true),
          reject: () => {
          }
        }
      });
      return;
    } else if (confirm === false && this.commissionBeneficiaryId && this.commissionBeneficiary.endDate) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          message: "Vous êtes sur le point de suspendre ce bénéficière. Etes-vous sûr de vouloir continuer ?",
          title: 'Attention!',
          confirm: () => this.save(true),
          reject: () => {
          }
        }
      });
      return;
    }
    let request: Observable<any>;
    if (this.commissionBeneficiaryId)
      request = this.commissionBeneficiaryService.update(this.commissionBeneficiary);
    else
      request = this.commissionBeneficiaryService.create(this.commissionBeneficiary);
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
          msg = "Impossible de continuer. Veuillez vérifier les données saisies. La date de clôture est antérieure à une ou plusieurs vente(s) qui utilise cette affectation de commission au bénéficiaire!";
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
    return this.updateForm.valid;
  }

}
