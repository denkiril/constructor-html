import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';

import { Site, SitesResponse } from './interfaces';


@Injectable({
  providedIn: 'root'
})
export class SitesService {
  
  private sitesUrl = 'api/sites';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient
  ) { }

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

  // sitesResponse$: Observable<SitesResponse>;

  /** GET sites from the server, with search and pagination */
  getSites(pageParam = '', pageSize = 0, searchTerm = ''): Observable<SitesResponse | null> {
    const url = searchTerm ? `${this.sitesUrl}/?title=${searchTerm}` : this.sitesUrl;

    return this.http.get<Site[]>(url).pipe(
      tap(_ => console.log(`getSites: searchTerm=${searchTerm}`)),
      switchMap(sites => {
        const pageIndex = (sites.length > pageSize && Number(pageParam)) ? Number(pageParam) : 1;
        const start = (pageIndex - 1) * pageSize;
        const sitesArr = pageSize ? sites.slice(start, start + pageSize) : sites;

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
      catchError(this.handleError<any>('update'))
    );
  }
}
