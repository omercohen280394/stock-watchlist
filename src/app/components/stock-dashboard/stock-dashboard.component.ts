import { Component, OnInit } from '@angular/core';
import { StockService, Stock, MarketIndex } from '../../services/stock.service';

export interface SectorGroup {
  sector: string;
  stocks: Stock[];
}

@Component({
  selector: 'app-stock-dashboard',
  templateUrl: './stock-dashboard.component.html',
  styleUrls: ['./stock-dashboard.component.scss']
})
export class StockDashboardComponent implements OnInit {
  stocks: Stock[] = [];
  groupedStocks: SectorGroup[] = [];
  indices: MarketIndex[] = [];

  selectedSector: string = 'All';
  sectors: string[] = ['All']; // נבנה באופן דינמי מהמניות

  newSymbol: string = '';
  showAddModal: boolean = false;

  constructor(private stockService: StockService) {}

  ngOnInit() {
    this.stockService.getStocks().subscribe(data => {
      this.stocks = data;
      this.updateAvailableSectors();
      this.groupStocksBySector();
    });

    this.stockService.getIndices().subscribe(data => {
      this.indices = data;
    });
  }

  // עדכון דינמי של רשימת הסקטורים שמופיעים ב-Dropdown בהתבסס על המניות הקיימות
  private updateAvailableSectors() {
    const uniqueSectors = Array.from(new Set(this.stocks.map(s => s.sector)));
    this.sectors = ['All', ...uniqueSectors];
    
    // אם הסקטור שנבחר כבר לא קיים ברשימה (למשל מניה נמחקה), תחזור ל-'All'
    if (!this.sectors.includes(this.selectedSector)) {
      this.selectedSector = 'All';
    }
  }

  filterBySector(sector: string) {
    this.selectedSector = sector;
    this.groupStocksBySector();
  }

  private groupStocksBySector() {
    let filtered = this.stocks;
    if (this.selectedSector !== 'All') {
      filtered = this.stocks.filter(s => s.sector === this.selectedSector);
    }

    const groupsMap = new Map<string, Stock[]>();
    filtered.forEach(stock => {
      const current = groupsMap.get(stock.sector) || [];
      current.push(stock);
      groupsMap.set(stock.sector, current);
    });

    this.groupedStocks = Array.from(groupsMap.entries()).map(([sector, stocks]) => ({
      sector,
      stocks
    }));
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