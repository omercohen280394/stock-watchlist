import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { StockDashboardComponent } from './components/stock-dashboard/stock-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    StockDashboardComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
