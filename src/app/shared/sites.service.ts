import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
// import { catchError, map, tap, switchMap } from 'rxjs/operators';

import { NgxIndexedDBService } from 'ngx-indexed-db';

import { Site, SitesResponse } from './interfaces';


@Injectable({
  providedIn: 'root'
})
export class SitesService {

  constructor(
    private dbService: NgxIndexedDBService
  ) { }

  /** GET sites from the server, with search and pagination */
  getSites(pageParam = '', pageSize = 0, searchTerm = ''): Observable<SitesResponse | null> {
    return new Observable(subscriber => {
      this.dbService.getAll<Site>('sites').then(
        sites => {
          console.log(`getSites: searchTerm=${searchTerm}, pageSize=${pageSize}`);
          if (searchTerm) {
            sites = sites.filter(site => site.title.toLowerCase().includes(searchTerm.toLowerCase()));
          }
          const pageIndex = (sites.length > pageSize && Number(pageParam)) ? Number(pageParam) : 1;
          const start = (pageIndex - 1) * pageSize;
          const sitesArr = pageSize ? sites.slice(start, start + pageSize) : sites;
          // console.log(`getSites: pageIndex=${pageIndex}, start=${start}, end=${start + pageSize}`);
          subscriber.next({
            sites: sitesArr,
            sitesLen: sites.length,
            pageIndex,
          });
        },
        error => {
          console.error('getAll sites error', error);
          subscriber.next();
        }
      );
    });
  }

  /** POST: add a new site to the server */
  addSite(site: Site): Observable<Site> {
    return new Observable(subscriber => {
      this.dbService.add('sites', site).then(
        () => {
          console.log('addSite in IDB:', site);
          subscriber.next(site);
        },
        error => {
          console.error('setPageSize error', error);
          subscriber.next(null);
        }
      );
    });
  }

  /** GET hero by id. Will 404 if id not found */
  getById(id: number | string): Observable<Site> {
    return new Observable(subscriber => {
      this.dbService.getByKey('sites', +id).then(
        site => {
          console.log(`getByKey site id=${id}`);
          subscriber.next({
            ...site,
            createDate: new Date(site.createDate),
          });
        },
        error => {
          console.error('getByKey site error', error);
          subscriber.next();
        }
      );
    });
  }

  /** PUT: update the site on the server */
  update(site: Site): Observable<any> {
    return new Observable(subscriber => {
      this.dbService.update('sites', site).then(
        () => {
          console.log('update site in IDB:', site);
          subscriber.next();
        },
        error => {
          console.error('update site error', error);
          subscriber.next();
        }
      );
    });
  }

  /** DELETE: delete the site from the server. Return true (deleted) or false. */
  delete(site: Site | number): Observable<boolean> {
    const id = typeof site === 'number' ? site : site.id;
    return new Observable(subscriber => {
      this.dbService.delete('sites', id).then(
        () => {
          console.log(`deleted site id=${id}`);
          subscriber.next(true);
        },
        error => {
          console.error(error);
          subscriber.next(false);
        }
      );
    });
  }

  /** GET pageSize from the server */
  getPageSize(): Observable<number> {
    return new Observable(subscriber => {
      this.dbService.getByKey('options', 'pageSize').then(
        pageSize => {
          // console.log('pageSize from IDB:', pageSize);
          const value = pageSize ? Number(pageSize.value) : 0;
          subscriber.next(value);
        },
        error => {
            console.error('getPageSize error', error);
            subscriber.next(0);
        }
      );
    });
  }

  /** PUT: update the options.pageSize on the server */
  setPageSize(pageSize: number): Observable<any> {
    return new Observable(subscriber => {
      this.dbService.update('options', {id: 'pageSize', value: pageSize}).then(
        () => {
          // console.log('update pageSize in IDB:', pageSize);
          subscriber.next();
        },
        error => {
          console.error('setPageSize error', error);
          subscriber.next();
        }
      );
    });
  }
}
