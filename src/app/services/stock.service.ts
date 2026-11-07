import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  isCurrency?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  // מפתח API חינמי (למשל מ-Finnhub.io)
  private apiKey = 'dbnnll9r01qpqmfmds1gdbnnll9r01qpqmfmds20';
  private baseUrl = 'https://finnhub.io/api/v1';

  private stocksSubject = new BehaviorSubject<Stock[]>([]);
  private indicesSubject = new BehaviorSubject<MarketIndex[]>([]);

  // רשימת מניות ברירת מחדל לטעינה ראשונית
  private defaultSymbols = ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA'];

  constructor(private http: HttpClient) {
    this.refreshAllData();
  }

  getStocks(): Observable<Stock[]> {
    return this.stocksSubject.asObservable();
  }

  getIndices(): Observable<MarketIndex[]> {
    return this.indicesSubject.asObservable();
  }

  // טעינה חי של כל הנתונים בלייב
  refreshAllData() {
    this.fetchIndicesLive().subscribe(indices => this.indicesSubject.next(indices));
    
    const savedSymbols = this.loadSavedSymbols();
    const symbolsToFetch = savedSymbols.length > 0 ? savedSymbols : this.defaultSymbols;
    
    this.fetchStocksLive(symbolsToFetch).subscribe(stocks => this.stocksSubject.next(stocks));
  }

  // שליפת מחיר מניה בודדת בלייב מ-Finnhub
  private fetchQuote(symbol: string): Observable<{ price: number; change: number; changePercent: number }> {
    return this.http.get<any>(`${this.baseUrl}/quote?symbol=${symbol}&token=${this.apiKey}`).pipe(
      map(res => ({
        price: res.c || 0,           // Current price
        change: res.d || 0,          // Change
        changePercent: res.dp || 0   // Change percent
      })),
      catchError(() => of({ price: 0, change: 0, changePercent: 0 }))
    );
  }

  // שליפת מדדים חיים
  private fetchIndicesLive(): Observable<MarketIndex[]> {
    return forkJoin({
      voo: this.fetchQuote('VOO'),
      mags: this.fetchQuote('MAGS'),
      rut: this.fetchQuote('IWM'), // IWM ETF לעקיבה אחרי Russell 2000
      usdIls: this.fetchQuote('USD/ILS')
    }).pipe(
      map(data => [
        { symbol: 'S&P 500 (VOO)', name: 'Vanguard S&P 500 ETF', price: data.voo.price, changePercent: data.voo.changePercent },
        { symbol: 'MAGS', name: 'Magnificent 7 ETF', price: data.mags.price, changePercent: data.mags.changePercent },
        { symbol: 'Russell 2000 (IWM)', name: 'Russell 2000 ETF', price: data.rut.price, changePercent: data.rut.changePercent },
        { symbol: 'USD/ILS', name: 'USD to ILS', price: data.usdIls.price, changePercent: data.usdIls.changePercent, isCurrency: true }
      ])
    );
  }

  // שליפת מניות מרובות
  private fetchStocksLive(symbols: string[]): Observable<Stock[]> {
    const requests = symbols.map(sym => 
      this.fetchQuote(sym).pipe(
        map(q => ({
          symbol: sym,
          name: `${sym} Inc.`,
          sector: 'Market',
          price: q.price,
          change: q.change,
          changePercent: q.changePercent
        }))
      )
    );
    return forkJoin(requests);
  }

  addStock(symbolInput: string) {
    const cleanSymbol = symbolInput.trim().toUpperCase();
    if (!cleanSymbol) return;

    const currentStocks = this.stocksSubject.value;
    if (currentStocks.some(s => s.symbol === cleanSymbol)) {
      alert('המניה כבר קיימת ברשימה!');
      return;
    }

    this.fetchQuote(cleanSymbol).subscribe(q => {
      const newStock: Stock = {
        symbol: cleanSymbol,
        name: `${cleanSymbol} Corp.`,
        sector: 'Technology',
        price: q.price,
        change: q.change,
        changePercent: q.changePercent
      };

      const updated = [newStock, ...currentStocks];
      this.stocksSubject.next(updated);
      this.saveSymbols(updated.map(s => s.symbol));
    });
  }

  removeStock(symbol: string) {
    const updated = this.stocksSubject.value.filter(s => s.symbol !== symbol);
    this.stocksSubject.next(updated);
    this.saveSymbols(updated.map(s => s.symbol));
  }

  private saveSymbols(symbols: string[]) {
    localStorage.setItem('user_stock_symbols', JSON.stringify(symbols));
  }

  private loadSavedSymbols(): string[] {
    const saved = localStorage.getItem('user_stock_symbols');
    return saved ? JSON.parse(saved) : [];
  }
}