import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

import { UiComponentsRoutes } from './ui-components.routing';

// ui components
import { AppBadgeComponent } from './badge/badge.component';
import { AppChipsComponent } from './chips/chips.component';
import { AppListsComponent } from './lists/lists.component';
import { AppMenuComponent } from './menu/menu.component';
import { AppTooltipsComponent } from './tooltips/tooltips.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MerchantManagementComponent } from './merchant.management/merchant.management.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { UpdateMerchantComponent } from './merchant.management/update.merchant/update.merchant.component';
import { ShipownersManagamentComponent } from './shipowners.managament/shipowners.managament.component';
import { UpdateShipownerComponent } from './shipowners.managament/update-shipowner/update-shipowner.component';
import { GeneralSettingsComponent } from './general.settings/general.settings.component';
import { AddBoatActivityTypeComponent } from './general.settings/add.boat.activity.type/add.boat.activity.type.component';
import { UpdateShipComponent } from './ships.management/update.ship/update.ship.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { UpdateCommissionComponent } from './general.settings/update-commission/update-commission.component';
import { CommissionHistoryComponent } from './general.settings/commission-history/commission-history.component';
import { UpdateBeneficiaryComponent } from './general.settings/update-beneficiary/update-beneficiary.component';
import { UpdateCommissionBeneficiaryComponent } from './general.settings/update-commission-beneficiary/update-commission-beneficiary.component';
import { UpdateArticleComponent } from './general.settings/update-article/update-article.component';
import { SalesComponent } from './sales/sales/sales.component';
import { UpdateSalesComponent } from './sales/update-sales/update-sales.component';
import { UpdateSalesTransactionComponent } from './sales/update-sales-transaction/update-sales-transaction.component';
import { BalanceComponent } from './balance/balance.component';
import { BoxesComponent } from './boxes/boxes/boxes.component';
import { BoxesMovementComponent } from './boxes/boxes-movement/boxes-movement.component';
import { UpdateBoxesMovementComponent } from './boxes/update-boxes-movement/update-boxes-movement.component';
import { MerchantPurchasesComponent } from './merchant-purchases/merchant-purchases.component';
import { PaymentsComponent } from './payments/payments.component';
import { UpdateBankComponent } from './general.settings/update-bank/update-bank.component';
import { UpdatePaymentComponent } from './payments/update-payment/update-payment.component';
import { UpdateSalesTransactionPaymentComponent } from './payments/update-sales-transaction-payment/update-sales-transaction-payment.component';
import { UpdateSalePaymentComponent } from './payments/update-sale-payment/update-sale-payment.component';
import { ProducerPaymentComponent } from './payments/producer-payment/producer-payment.component';
import { CashTransactionComponent } from './payments/cash-transaction/cash-transaction.component';
import { UpdateCashTransactionComponent } from './payments/update-cash-transaction/update-cash-transaction.component';
import { CommissionDetailsComponent } from './balance/commission-details/commission-details.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(UiComponentsRoutes),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule.pick(TablerIcons),
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule
  ],
  declarations: [
    AppBadgeComponent,
    AppChipsComponent,
    AppListsComponent,
    AppMenuComponent,
    AppTooltipsComponent,
    MerchantManagementComponent,
    UpdateMerchantComponent,
    ShipownersManagamentComponent,
    UpdateShipownerComponent,
    GeneralSettingsComponent,
    AddBoatActivityTypeComponent,
    UpdateShipComponent,
    ConfirmDialogComponent,
    UpdateCommissionComponent,
    CommissionHistoryComponent,
    UpdateBeneficiaryComponent,
    UpdateCommissionBeneficiaryComponent,
    UpdateArticleComponent,
    SalesComponent,
    UpdateSalesComponent,
    UpdateSalesTransactionComponent,
    BalanceComponent,
    BoxesComponent,
    BoxesMovementComponent,
    UpdateBoxesMovementComponent,
    MerchantPurchasesComponent,
    PaymentsComponent,
    UpdateBankComponent,
    UpdatePaymentComponent,
    UpdateSalesTransactionPaymentComponent,
    UpdateSalePaymentComponent,
    ProducerPaymentComponent,
    CashTransactionComponent,
    UpdateCashTransactionComponent,
    CommissionDetailsComponent,
  ],
})
export class UicomponentsModule { }
