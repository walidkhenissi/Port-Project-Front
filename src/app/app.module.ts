import {DEFAULT_CURRENCY_CODE, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

// icons
import {TablerIconsModule} from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

//Import all material modules
import {MaterialModule} from './material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

//Import Layouts
import {FullComponent} from './layouts/full/full.component';
import {BlankComponent} from './layouts/blank/blank.component';

// Vertical Layout
import {SidebarComponent} from './layouts/full/sidebar/sidebar.component';
import {HeaderComponent} from './layouts/full/header/header.component';
import {BrandingComponent} from './layouts/full/sidebar/branding.component';
import {AppNavItemComponent} from './layouts/full/sidebar/nav-item/nav-item.component';
import {JWT_OPTIONS, JwtHelperService, JwtModule} from '@auth0/angular-jwt';
import {HttpClientService} from "./utils/http-client.service";
import {FilterDialogComponent} from "./pages/ui-components/dialogs/filter-dialog/filter-dialog.component";
import {GetValuePipe} from './pipes/get-value.pipe';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import localeFr from '@angular/common/locales/fr';
import {registerLocaleData} from "@angular/common";
import {LoadingSpinnerService} from "./services/loading-spinner.service";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {HttpInterceptorService} from "./utils/http-interceptor.service";
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from "@angular/material-moment-adapter";

registerLocaleData(localeFr);

export function jwtOptionsFactory() {
  return {
    tokenGetter: () => {
      return localStorage.getItem('token');
    },
  };
}
export const MY_FORMATS = {
  parse: {
    //    dateInput: 'L',
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    //    dateInput: 'L'
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@NgModule({
  declarations: [
    AppComponent,
    FullComponent,
    BlankComponent,
    SidebarComponent,
    HeaderComponent,
    BrandingComponent,
    AppNavItemComponent,
    FilterDialogComponent,
    GetValuePipe
  ],
  entryComponents: [
    FilterDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TablerIconsModule.pick(TablerIcons),
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
      },
    }),
    MatProgressSpinnerModule
  ],
  providers: [JwtHelperService,
    HttpClientService,
    {provide: MAT_DATE_LOCALE, useValue: 'fr'},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}},
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {strict: true}},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    LoadingSpinnerService,
    {provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true},
  ],
  exports: [TablerIconsModule],
  bootstrap: [AppComponent],
})
export class AppModule {
}

