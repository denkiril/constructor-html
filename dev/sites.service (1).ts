import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';

import { NgxIndexedDBService } from 'ngx-indexed-db';

import { Site, SitesResponse } from './interfaces';


@Injectable({
  providedIn: 'root'
})
export class SitesService {
  
  private sitesUrl = 'api/sites';  // URL to web api
  private optionsUrl = 'api/options';  // URL to web api options

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private openRequest: IDBOpenDBRequest;
  // private chdb: IDBDatabase;
  
  private init(): void {
    console.log('sites.service init');
    this.openRequest = indexedDB.open("chdb", 1);
    // создаём хранилище объектов для sites, если ешё не существует
    this.openRequest.onupgradeneeded = function() {
      console.log("openRequest.onupgradeneeded");
      let db = this.result;
      if (!db.objectStoreNames.contains('sites')) { // if there's no "sites" store
        db.createObjectStore('sites', {keyPath: 'id', autoIncrement: true }); // create it
      }
      if (!db.objectStoreNames.contains('options')) { // if there's no "options" store
        db.createObjectStore('options', {keyPath: 'id'}); // create it
      }
    }

    this.openRequest.onsuccess = function() {
      console.log("openRequest.onsuccess");
      let db = this.result;
      // let transaction = db.transaction('sites', 'readwrite');
      // let sites = transaction.objectStore('sites');
      // let request = sites.add({title: 'title test'});
      let transaction = db.transaction('options', 'readwrite');
      let options = transaction.objectStore('options');
      let request = options.add({id: 'pageSize', value: 5});
    }

    this.openRequest.onerror = function() {
      console.error("openRequest.onerror", this.error);
    };
  }

  constructor(
    private http: HttpClient,
    private dbService: NgxIndexedDBService
  ) {
    // this.init();
  }

  /** GET sites from the server */
  getAll(): Observable<Site[]> {
    return this.http.get<Site[]>(this.sitesUrl)
      .pipe(
        tap(_ => console.log('fetched all sites')),
        catchError(this.handleError<Site[]>('getAll', []))
      );
  }

  /* GET sites whose name contains search term */
  searchSites(term: string): Observable<Site[]> {
    if (!term.trim()) {
      // if not search term, return empty sites array.
      return of([]);
    }

    return this.http.get<Site[]>(`${this.sitesUrl}/?title=${term}`)
      .pipe(
        tap(x => x.length ?
          console.log(`found sites matching "${term}"`) :
          console.log(`no sites matching "${term}"`)),
        catchError(this.handleError<Site[]>('searchSites', []))
      );
  }

  /** GET sites from the server, with search and pagination */
  getSites(pageParam = '', pageSize = 0, searchTerm = ''): Observable<SitesResponse | null> {
    const url = searchTerm ? `${this.sitesUrl}/?title=${searchTerm}` : this.sitesUrl;

    return this.http.get<Site[]>(url).pipe(
      tap(_ => console.log(`getSites: searchTerm=${searchTerm}, pageSize=${pageSize}`)),
      switchMap(sites => {
        const pageIndex = (sites.length > pageSize && Number(pageParam)) ? Number(pageParam) : 1;
        const start = (pageIndex - 1) * pageSize;
        const sitesArr = pageSize ? sites.slice(start, start + pageSize) : sites;
        console.log(`getSites: pageIndex=${pageIndex}, start=${start}, end=${start + pageSize}`);

        return of({
          sites: sitesArr,
          sitesLen: sites.length,
          pageIndex,
        })
      }),
      catchError(this.handleError<null>('getAll', null))
    )

    // return of({
    //   sites,
    //   lenght: 0,
    //   pageIndex: 1,
    // });
  }

  /** POST: add a new site to the server */
  addSite(site: Site): Observable<Site> {
    return this.http.post<Site>(this.sitesUrl, site, this.httpOptions).pipe(
      tap((newSite: Site) => console.log(`added site w/ id=${newSite.id}`)),
      catchError(this.handleError<Site>('addSite'))
    );
  }

  /** GET hero by id. Will 404 if id not found */
  getById(id: number): Observable<Site> {
    const url = `${this.sitesUrl}/${id}`;

    return this.http.get<Site>(url).pipe(
      tap(_ => console.log(`fetched site id=${id}`)),
      map((site: Site) => {
        return {
          ...site,
          createDate: new Date(site.createDate),
        }
      }),
      catchError(this.handleError<Site>(`getById id=${id}`))
    );
  }

  /** PUT: update the site on the server */
  update(site: Site): Observable<any> {
    return this.http.put(this.sitesUrl, site, this.httpOptions).pipe(
      tap(_ => console.log(`updated site id=${site.id}`)),
      catchError(this.handleError<any>('update site'))
    );
  }

  /** DELETE: delete the site from the server */
  delete(site: Site | number): Observable<Site> {
    const id = typeof site === 'number' ? site : site.id;
    const url = `${this.sitesUrl}/${id}`;

    return this.http.delete<Site>(url, this.httpOptions).pipe(
      tap(_ => console.log(`deleted site id=${id}`)),
      catchError(this.handleError<Site>('delete site'))
    );
  }


  /** GET pageSize from the server */
  getPageSize(): Observable<number> {
    // const url = `${this.optionsUrl}/pageSize`;
    // const openRequest = indexedDB.open("chdb", 1);

    return new Observable(subscriber => {
      this.dbService.getByKey('options', 'pageSize').then(
        pageSize => {
          console.log('pageSize from IDB:', pageSize);
          const value = pageSize ? Number(pageSize.value) : 0;
          subscriber.next(value);
        },
        error => {
            console.error('getPageSize error', error);
            subscriber.next(0);
        }
      );
      // openRequest.onsuccess = function() {
      //   console.log('getPageSize openRequest.onsuccess');
      //   let db = this.result;
      //   // let transaction = db.transaction('sites', 'readwrite');
      //   // let sites = transaction.objectStore('sites');
      //   // let request = sites.add({title: 'title test'});
      //   let transaction = db.transaction('options', 'readonly');
      //   let options = transaction.objectStore('options');
      //   let request = options.get('pageSize');
      //   request.onsuccess = function() {
      //     console.log('pageSize from IDB:', this.result.value);
      //     // return of(Number(this.result.value));
      //     subscriber.next(Number(this.result.value));
      //   }
      //   request.onerror = function() {
      //     console.error("getPageSize request.onerror", this.error);
      //     subscriber.next(0);
      //   };
      // }
      // openRequest.onerror = function() {
      //   console.error("getPageSize openRequest.onerror", this.error);
      //   subscriber.next(0);
      // };
    });

    // return this.http.get<any>(url)
    //   .pipe(
    //     tap(_ => console.log('fetched options/pageSize')),
    //     switchMap(obj => {
    //       return of(Number(obj.value));
    //     }),
    //     catchError(this.handleError<any>('getPageSize', {}))
    //   );
  }

  /** POST: add a new site to the server */
  // setPageSize(pageSize: number): Observable<number> {
  //   return of(pageSize);
  // }

  /** PUT: update the options.pageSize on the server */
  setPageSize(pageSize: number): Observable<any> {
    return new Observable(subscriber => {
      this.dbService.update('options', {id: 'pageSize', value: pageSize}).then(
        () => {
          console.log('update pageSize in IDB:', pageSize);
          subscriber.next();
        },
        error => {
          console.error('setPageSize error', error);
          subscriber.next();
        }
      );
    });

    // return this.http.put(this.optionsUrl, {id: 'pageSize', value: pageSize}, this.httpOptions).pipe(
    //   tap(_ => console.log(`updated options.pageSize=${pageSize}`)),
    //   catchError(this.handleError<any>('setPageSize'))
    // );
  }
}
