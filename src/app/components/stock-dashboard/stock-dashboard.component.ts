import { Component, OnInit } from '@angular/core';
import { StockService, Stock, MarketIndex } from '../../services/stock.service';

@Component({
  selector: 'app-stock-dashboard',
  templateUrl: './stock-dashboard.component.html',
  styleUrls: ['./stock-dashboard.component.scss']
})
export class StockDashboardComponent implements OnInit {
  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  indices: MarketIndex[] = [];

  selectedSector: string = 'All';
  sectors: string[] = ['All', 'Information Technology', 'Communication Services', 'Consumer Discretionary', 'Financials', 'Health Care', 'Energy'];

  newSymbol: string = '';
  showAddModal: boolean = false;

  constructor(private stockService: StockService) {}

  ngOnInit() {
    this.stockService.getStocks().subscribe(data => {
      this.stocks = data;
      this.filterBySector(this.selectedSector);
    });

    this.stockService.getIndices().subscribe(data => {
      this.indices = data;
    });
  }

  filterBySector(sector: string) {
    this.selectedSector = sector;
    if (sector === 'All') {
      this.filteredStocks = this.stocks;
    } else {
      this.filteredStocks = this.stocks.filter(s => s.sector === sector);
    }
  }

  onAddStock() {
    if (!this.newSymbol) {
      alert('נא להזין סימבול מניה');
      return;
    }

    this.stockService.addStock(this.newSymbol);

    this.newSymbol = '';
    this.showAddModal = false;
  }

  onRemoveStock(symbol: string, event: Event) {
    event.stopPropagation();
    if (confirm(`להסיר את ${symbol} מהרשימה?`)) {
      this.stockService.removeStock(symbol);
    }
  }
}