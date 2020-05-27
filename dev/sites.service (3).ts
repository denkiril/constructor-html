import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
// import { catchError, map, tap, switchMap } from 'rxjs/operators';

import { NgxIndexedDBService } from 'ngx-indexed-db';

import { Site, SitesResponse } from './interfaces';

type IDBStoreName = 'sites' | 'options';
type IDBRequestName = 'count' | 'getAll';

@Injectable({
  providedIn: 'root'
})
export class SitesService {
  idbName = 'chdb';
  idbVersion = 1;

  private idb(storeName: IDBStoreName, requestName: IDBRequestName): Observable<any> {
    console.log('idb:', storeName, requestName);

    return new Observable(subscriber => {
      const openRequest = indexedDB.open(this.idbName, this.idbVersion);
      const transactionMode: IDBTransactionMode = 'readonly'; // 'count' | 'getAll'

      openRequest.onsuccess = function () {  
        const db = this.result;
        const transaction = db.transaction(storeName, transactionMode);
        const store = transaction.objectStore(storeName);
        console.log('count in store:', 'count' in store);
        console.log('openCursor in store:', 'openCursor' in store);
        console.log(store);

        let request: IDBRequest;

        function getResult() {
          const result = request.result;
          console.log(`${requestName} request.onsuccess:`, result);
          subscriber.next(result);
        }

        let resultArr = [];
        function getCursor() {
          let cursor = request.result;
          if (cursor) {
            // let key = cursor.key; // ключ книги (поле id)
            // let value = cursor.value; // объект книги
            // console.log(key, value);
            resultArr.push(cursor.value);
            cursor.continue();
          } else {
            console.log('resultArr:', resultArr);
            subscriber.next(resultArr);
          }
        };

        switch(requestName) {
          case 'count': 
            request = store.count();
            request.onsuccess = getResult;
            break;
          case 'getAll': 
            request = store.openCursor();
            request.onsuccess = getCursor;
            break;
        }
        console.log(request);

        request.onerror = function () {
          console.error(`${requestName} request.onerror:`, this.error);
        };
      }

      openRequest.onerror = function () {
        console.error(`${requestName} openRequest.onerror:`, this.error);
      };
    });
  }

  constructor(
    private dbService: NgxIndexedDBService
  ) { }

  /** GET sites count from IDB */
  getSitesLen(): Observable<number> {
    console.log('getSitesLen() start...');
    return new Observable(subscriber => {
      this.idb('sites', 'count').subscribe(count => subscriber.next(count));
    });
  }

  /** GET sites from the server, with search and pagination */
  getSites(pageParam = '', pageSize = 0, searchTerm = ''): Observable<SitesResponse | null> {
    return new Observable(subscriber => {
      this.idb('sites', 'getAll').subscribe(sites => {
        sites = sites || [];
        console.log(`getSites: searchTerm=${searchTerm}, pageSize=${pageSize}`);
        console.log('sites:', sites);
        if (searchTerm && sites.lenght) {
          sites = sites.filter(site => site['title'].toLowerCase().includes(searchTerm.toLowerCase()));
        }
        const pageIndex = (sites.length > pageSize && Number(pageParam)) ? Number(pageParam) : 1;
        const start = (pageIndex - 1) * pageSize;
        const sitesArr = pageSize ? sites.slice(start, start + pageSize) : sites;
        // console.log(`getSites: pageIndex=${pageIndex}, start=${start}, end=${start + pageSize}`);
        subscriber.next({
          sites: sitesArr as Site[],
          sitesLen: sites.length,
          pageIndex,
        });
      });
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
