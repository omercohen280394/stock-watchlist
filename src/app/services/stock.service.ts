import { Injectable } from '@angular/core';
import { Observable, interval, map, startWith } from 'rxjs';

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private stocks: Stock[] = [
    { symbol: 'NVDA', name: 'Nvidia', sector: 'Information Technology', price: 135.20, change: 2.45, changePercent: 1.85 },
    { symbol: 'MSFT', name: 'Microsoft', sector: 'Information Technology', price: 428.50, change: -1.20, changePercent: -0.28 },
    { symbol: 'GOOGL', name: 'Alphabet', sector: 'Communication Services', price: 176.80, change: 0.95, changePercent: 0.54 },
    { symbol: 'META', name: 'Meta Platforms', sector: 'Communication Services', price: 585.10, change: 8.30, changePercent: 1.44 },
    { symbol: 'AMZN', name: 'Amazon', sector: 'Consumer Discretionary', price: 186.40, change: 1.15, changePercent: 0.62 },
    { symbol: 'TSLA', name: 'Tesla', sector: 'Consumer Discretionary', price: 218.90, change: -4.50, changePercent: -2.01 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financials', price: 462.30, change: 0.40, changePercent: 0.09 },
    { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', price: 222.10, change: 1.80, changePercent: 0.82 },
    { symbol: 'LLY', name: 'Eli Lilly', sector: 'Health Care', price: 912.00, change: 12.50, changePercent: 1.39 },
    { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Health Care', price: 575.40, change: -2.10, changePercent: -0.36 },
    { symbol: 'GE', name: 'GE Aerospace', sector: 'Industrials', price: 184.60, change: 3.10, changePercent: 1.71 },
    { symbol: 'CAT', name: 'Caterpillar', sector: 'Industrials', price: 388.70, change: -0.80, changePercent: -0.21 },
    { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Staples', price: 168.90, change: 0.35, changePercent: 0.21 },
    { symbol: 'COST', name: 'Costco Wholesale', sector: 'Consumer Staples', price: 895.30, change: 5.40, changePercent: 0.61 },
    { symbol: 'XOM', name: 'ExxonMobil', sector: 'Energy', price: 118.20, change: -1.05, changePercent: -0.88 },
    { symbol: 'CVX', name: 'Chevron', sector: 'Energy', price: 154.60, change: -0.40, changePercent: -0.26 },
    { symbol: 'NEE', name: 'NextEra Energy', sector: 'Utilities', price: 82.40, change: 0.60, changePercent: 0.73 },
    { symbol: 'SO', name: 'Southern Company', sector: 'Utilities', price: 88.10, change: 0.15, changePercent: 0.17 },
    { symbol: 'LIN', name: 'Linde', sector: 'Materials', price: 465.00, change: 2.10, changePercent: 0.45 },
    { symbol: 'FCX', name: 'Freeport-McMoRan', sector: 'Materials', price: 48.90, change: -0.75, changePercent: -1.51 },
    { symbol: 'PLD', name: 'Prologis', sector: 'Real Estate', price: 124.80, change: 0.90, changePercent: 0.73 },
    { symbol: 'AMT', name: 'American Tower', sector: 'Real Estate', price: 228.30, change: -1.10, changePercent: -0.48 }
  ];

  getStocks(): Observable<Stock[]> {
    // מייצר עדכון מחירים אקראי קטן כל 3 שניות כדי לדמות מסחר חי
    return interval(3000).pipe(
      startWith(0),
      map(() => {
        this.stocks = this.stocks.map(stock => {
          const fluctuation = (Math.random() - 0.48) * 0.5; // תנודתיות קטנה
          const newPrice = Number((stock.price + fluctuation).toFixed(2));
          const newChange = Number((stock.change + fluctuation).toFixed(2));
          return {
            ...stock,
            price: newPrice,
            change: newChange
          };
        });
        return [...this.stocks];
      })
    );
  }
}