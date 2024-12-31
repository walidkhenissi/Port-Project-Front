import {Routes} from '@angular/router';

// ui
import {AppBadgeComponent} from './badge/badge.component';
import {AppChipsComponent} from './chips/chips.component';
import {AppListsComponent} from './lists/lists.component';
import {AppMenuComponent} from './menu/menu.component';
import {AppTooltipsComponent} from './tooltips/tooltips.component';
import {MerchantManagementComponent} from './merchant.management/merchant.management.component';
import {UpdateMerchantComponent} from './merchant.management/update.merchant/update.merchant.component';
import {ShipownersManagamentComponent} from './shipowners.managament/shipowners.managament.component';
import {UpdateShipownerComponent} from './shipowners.managament/update-shipowner/update-shipowner.component';
import {GeneralSettingsComponent} from './general.settings/general.settings.component';
import {AddBoatActivityTypeComponent} from './general.settings/add.boat.activity.type/add.boat.activity.type.component';
import {UpdateShipComponent} from "./ships.management/update.ship/update.ship.component";
import {UpdateCommissionComponent} from "./general.settings/update-commission/update-commission.component";
import {CommissionHistoryComponent} from "./general.settings/commission-history/commission-history.component";
import {UpdateBeneficiaryComponent} from "./general.settings/update-beneficiary/update-beneficiary.component";
import {
  UpdateCommissionBeneficiaryComponent
} from "./general.settings/update-commission-beneficiary/update-commission-beneficiary.component";
import {UpdateArticleComponent} from "./general.settings/update-article/update-article.component";
import {SalesComponent} from "./sales/sales/sales.component";
import {UpdateSalesComponent} from "./sales/update-sales/update-sales.component";
import {UpdateSalesTransactionComponent} from "./sales/update-sales-transaction/update-sales-transaction.component";
import {BalanceComponent} from "./balance/balance.component";
import {BoxesComponent} from "./boxes/boxes/boxes.component";
import {BoxesMovementComponent} from "./boxes/boxes-movement/boxes-movement.component";
import {UpdateBoxesMovementComponent} from "./boxes/update-boxes-movement/update-boxes-movement.component";
import {MerchantPurchasesComponent} from "./merchant-purchases/merchant-purchases.component";
import {PaymentsComponent} from "./payments/payments.component";
import {UpdateBankComponent} from "./general.settings/update-bank/update-bank.component";
import {UpdatePaymentComponent} from "./payments/update-payment/update-payment.component";
import {
  UpdateSalesTransactionPaymentComponent
} from "./payments/update-sales-transaction-payment/update-sales-transaction-payment.component";
import {UpdateSalePaymentComponent} from "./payments/update-sale-payment/update-sale-payment.component";
import {ProducerPaymentComponent} from "./payments/producer-payment/producer-payment.component";
import {CashTransactionComponent} from "./payments/cash-transaction/cash-transaction.component";
import {UpdateCashTransactionComponent} from "./payments/update-cash-transaction/update-cash-transaction.component";
import {CommissionDetailsComponent} from "./balance/commission-details/commission-details.component";

export const UiComponentsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'badge',
        component: AppBadgeComponent,
      },
      {
        path: 'chips',
        component: AppChipsComponent,
      },
      {
        path: 'lists',
        component: AppListsComponent,
      },
      {
        path: 'menu',
        component: AppMenuComponent,
      },
      {
        path: 'tooltips',
        component: AppTooltipsComponent,
      },
      {
        path: 'merchant-management',
        component: MerchantManagementComponent,
      },
      {
        path: 'add-merchant',
        component: UpdateMerchantComponent,
      },
      {
        path: 'update-merchant/:id',
        component: UpdateMerchantComponent,
      }
      ,
      {
        path: 'shipowner-management',
        component: ShipownersManagamentComponent,
      },
      {
        path: 'add-shipowner/:tab',
        component: UpdateShipownerComponent,
      },
      {
        path: 'update-shipowner/:id/:tab',
        component: UpdateShipownerComponent,
      }
      ,
      {path: 'general-settings', component: GeneralSettingsComponent},
      {path: 'general-settings/:tab', component: GeneralSettingsComponent},
      {path: 'add-ship', component: UpdateShipComponent},
      {path: 'update-ship/:id', component: UpdateShipComponent},
      {path: 'boat-activity-type/add/:tab', component: AddBoatActivityTypeComponent},
      {path: 'boat-activity-type/edit/:id/:tab', component: AddBoatActivityTypeComponent},
      {path: 'commission/add/:tab', component: UpdateCommissionComponent},
      {path: 'commission/edit/:id/:tab', component: UpdateCommissionComponent},
      {path: 'commissionHistory/add/:commissionId/:tab', component: CommissionHistoryComponent},
      {path: 'commissionHistory/edit/:id/:commissionId/:tab', component: CommissionHistoryComponent},
      {path: 'commissionBeneficiary/add/:commissionId/:tab', component: UpdateCommissionBeneficiaryComponent},
      {path: 'commissionBeneficiary/edit/:id/:commissionId/:tab', component: UpdateCommissionBeneficiaryComponent},
      {path: 'beneficiary/add/:tab', component: UpdateBeneficiaryComponent},
      {path: 'beneficiary/edit/:id/:tab', component: UpdateBeneficiaryComponent},
      {path: 'article/add/:tab', component: UpdateArticleComponent},
      {path: 'article/edit/:id/:tab', component: UpdateArticleComponent},
      {path: 'ship/add/:shipOwnerId/:tab', component: UpdateShipComponent},
      {path: 'ship/edit/:id/:shipOwnerId/:tab', component: UpdateShipComponent},
      {path: 'sales', component: SalesComponent},
      {path: 'sales/add/:tab', component: UpdateSalesComponent},
      {path: 'sales/edit/:id/:tab', component: UpdateSalesComponent},
      {path: 'salesTransaction/add/:saleId/:tab', component: UpdateSalesTransactionComponent},
      {path: 'salesTransaction/edit/:id/:saleId/:tab', component: UpdateSalesTransactionComponent},
      {path: 'salesTransaction/view/:id/:saleId', component: UpdateSalesTransactionComponent},
      {path: 'balance', component: BalanceComponent},
      {path: 'balance/:tab', component: BalanceComponent},
      {path: 'boxes', component: BoxesComponent},
      {path: 'boxes/:tab', component: BoxesComponent},
      // {path: 'boxes/add/:type/:tab', component: BoxesMovementComponent},
      {path: 'boxes/edit/:id/:tab', component: BoxesMovementComponent},
      {path: 'boxes/edit/:id/:prevTab1/:prevTab2', component: BoxesMovementComponent},
      {path: 'boxesTransaction/add/:boxesBalanceId/:prevTab1/:prevTab2', component: UpdateBoxesMovementComponent},
      {path: 'boxesTransaction/edit/:id/:boxesBalanceId/:prevTab1/:prevTab2', component: UpdateBoxesMovementComponent},
      {path: 'merchantPurchases', component: MerchantPurchasesComponent},
      {path: 'merchantPayment', component: PaymentsComponent},
      {path: 'producerPayment', component: ProducerPaymentComponent},
      {path: 'commissionaryPayment', component: PaymentsComponent},
      {path: 'bank/add/:tab', component: UpdateBankComponent},
      {path: 'bank/edit/:id/:tab', component: UpdateBankComponent},
      {path: 'payment/edit/:id/:context/:tab', component: UpdatePaymentComponent},
      {path: 'payment/add/:context/:tab', component: UpdatePaymentComponent},
      {path: 'salesTransactionPayment/edit/:id/:previousTab', component: UpdateSalesTransactionPaymentComponent},
      {path: 'salesTransactionPayment/add/:stid/:previousTab', component: UpdateSalesTransactionPaymentComponent},
      {
        path: 'salesTransactionPayment/edit/:saleId/:id/:previousTab',
        component: UpdateSalesTransactionPaymentComponent
      },
      {
        path: 'salesTransactionPayment/add/:saleId/:stid/:previousTab',
        component: UpdateSalesTransactionPaymentComponent
      },
      {
        path: 'paymentSalesTransaction/edit/:id/:context/:previousTab',
        component: UpdateSalesTransactionPaymentComponent
      },
      {
        path: 'paymentSalesTransaction/add/:pid/:context/:previousTab',
        component: UpdateSalesTransactionPaymentComponent
      },
      {path: 'paymentSale/edit/:id/:context/:previousTab', component: UpdateSalePaymentComponent},
      {path: 'paymentSale/add/:pid/:context/:previousTab', component: UpdateSalePaymentComponent},
      {path: 'paymentSaleFromSale/edit/:id/:saleId/:previousTab', component: UpdateSalePaymentComponent},
      {path: 'paymentSaleFromSale/add/:saleId/:previousTab', component: UpdateSalePaymentComponent},
      {path: 'cashTransaction', component: CashTransactionComponent},
      {path: 'cashTransaction/add', component: UpdateCashTransactionComponent},
      {path: 'cashTransaction/edit/:id', component: UpdateCashTransactionComponent},
      {path: 'balanceDetails/:beneficiaryId', component: CommissionDetailsComponent},
    ]
  }
];
