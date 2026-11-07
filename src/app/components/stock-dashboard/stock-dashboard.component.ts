import { Component, OnInit } from '@angular/core';
import { Stock, StockService } from '../../services/stock.service';

@Component({
  selector: 'app-stock-dashboard',
  templateUrl: './stock-dashboard.component.html',
  styleUrls: ['./stock-dashboard.component.scss']
})
export class StockDashboardComponent implements OnInit {
  stocks: Stock[] = [];
  selectedSector: string = 'All';
  sectors: string[] = ['All'];

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.stockService.getStocks().subscribe(data => {
      this.stocks = data;
      const uniqueSectors = Array.from(new Set(data.map(s => s.sector)));
      if (this.sectors.length === 1) {
        this.sectors = ['All', ...uniqueSectors];
      }
    });
  }

  get filteredStocks(): Stock[] {
    if (this.selectedSector === 'All') {
      return this.stocks;
    }
    return this.stocks.filter(s => s.sector === this.selectedSector);
  }
}