import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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
  private apiKey = 'dbnnll9r01qpqmfmds1gdbnnll9r01qpqmfmds20';

  private baseUrl = 'https://finnhub.io/api/v1';

  private stocksSubject = new BehaviorSubject<Stock[]>([]);
  private indicesSubject = new BehaviorSubject<MarketIndex[]>([]);

  private defaultSymbols = ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'JNJ', 'JPM'];

  constructor(private http: HttpClient) {
    this.refreshAllData();
  }

  getStocks(): Observable<Stock[]> {
    return this.stocksSubject.asObservable();
  }

  getIndices(): Observable<MarketIndex[]> {
    return this.indicesSubject.asObservable();
  }

  refreshAllData() {
    this.fetchIndicesLive().subscribe(indices => this.indicesSubject.next(indices));

    const savedSymbols = this.loadSavedSymbols();
    const symbolsToFetch = savedSymbols.length > 0 ? savedSymbols : this.defaultSymbols;

    this.fetchStocksLive(symbolsToFetch).subscribe(stocks => this.stocksSubject.next(stocks));
  }

  // שליפת מחיר ונתוני מסחר
  private fetchQuote(symbol: string): Observable<{ price: number; change: number; changePercent: number }> {
    return this.http.get<any>(`${this.baseUrl}/quote?symbol=${symbol}&token=${this.apiKey}`).pipe(
      map(res => ({
        price: res.c || 0,
        change: res.d || 0,
        changePercent: res.dp || 0
      })),
      catchError(() => of({ price: 0, change: 0, changePercent: 0 }))
    );
  }

  // שליפת פרופיל חברה דינמי (שם מלא וסקטור אמיתי מהבורסה!)
  private fetchCompanyProfile(symbol: string): Observable<{ name: string; sector: string }> {
    return this.http.get<any>(`${this.baseUrl}/stock/profile2?symbol=${symbol}&token=${this.apiKey}`).pipe(
      map(res => ({
        name: res.name || `${symbol} Corp.`,
        // Finnhub מחזיר לרוב finnhubIndustry או sector
        sector: res.finnhubIndustry || res.sector || 'General'
      })),
      catchError(() => of({ name: `${symbol} Corp.`, sector: 'General' }))
    );
  }

  private fetchIndicesLive(): Observable<MarketIndex[]> {
    return forkJoin({
      voo: this.fetchQuote('VOO'),
      mags: this.fetchQuote('MAGS'),
      rut: this.fetchQuote('IWM'),
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

  private fetchStocksLive(symbols: string[]): Observable<Stock[]> {
    const requests = symbols.map(sym =>
      forkJoin({
        quote: this.fetchQuote(sym),
        profile: this.fetchCompanyProfile(sym)
      }).pipe(
        map(({ quote, profile }) => ({
          symbol: sym,
          name: profile.name,
          sector: profile.sector, // <-- סקטור דינמי אמיתי שמגיע ישירות מהשרת!
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent
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

    forkJoin({
      quote: this.fetchQuote(cleanSymbol),
      profile: this.fetchCompanyProfile(cleanSymbol)
    }).subscribe(({ quote, profile }) => {
      const newStock: Stock = {
        symbol: cleanSymbol,
        name: profile.name,
        sector: profile.sector,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent
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