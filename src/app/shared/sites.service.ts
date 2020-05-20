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
}
