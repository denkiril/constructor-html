import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import ruLocale from '@angular/common/locales/ru';
// import { HttpClientModule }    from '@angular/common/http';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService }  from './in-memory-data.service';
// import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';

import { AppComponent } from './app.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { FilterPipe } from './shared/filter.pipe';
import { AppRoutingModule } from './app-routing.module';
import { CreatePageComponent } from './create-page/create-page.component';
import { EditPageComponent } from './edit-page/edit-page.component';
import { OptionsPageComponent } from './options-page/options-page.component';
import { PreviewPageComponent } from './preview-page/preview-page.component';
import { NavbarComponent } from './navbar/navbar.component';

registerLocaleData(ruLocale, 'ru');

// const dbConfig: DBConfig = {
//   name: 'chdb',
//   version: 1,
//   objectStoresMeta: [
//     {
//       store: 'sites',
//       storeConfig: { keyPath: 'id', autoIncrement: true },
//       storeSchema: [],
//     },
//     {
//       store: 'options',
//       storeConfig: { keyPath: 'id', autoIncrement: false },
//       storeSchema: [],
//     },
//   ]
// };

@NgModule({
  declarations: [
    AppComponent,
    DashboardPageComponent,
    FilterPipe,
    CreatePageComponent,
    EditPageComponent,
    OptionsPageComponent,
    PreviewPageComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FontAwesomeModule,
    // HttpClientModule,
    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    // Remove it when a real server is ready to receive requests.
    // HttpClientInMemoryWebApiModule.forRoot(
    //   InMemoryDataService, { dataEncapsulation: false }
    // ),
    // NgxIndexedDBModule.forRoot(dbConfig),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
