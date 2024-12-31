import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import {LOCALE_ID} from "@angular/core";


// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));


platformBrowserDynamic().bootstrapModule(AppModule, {
  providers: [{provide: LOCALE_ID, useValue: 'fr-TN'}]
}).catch(err => console.error(err));;
