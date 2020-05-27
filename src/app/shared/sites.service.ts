import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { catchError, map, tap, switchMap } from 'rxjs/operators';
// import { NgxIndexedDBService } from 'ngx-indexed-db';

import { Site, SitesResponse } from './interfaces';

type IDBStoreName = 'sites' | 'options';
type IDBRequestName = 'count' | 'getAll' | 'search' | 'get' | 'add' | 'put' | 'delete';

@Injectable({
  providedIn: 'root'
})
export class SitesService {
  idbName = 'chdb';
  idbVersion = 1;

  private idbInit() {
    const openRequest = indexedDB.open(this.idbName, this.idbVersion);
    openRequest.onupgradeneeded = function() {
      console.log("openRequest.onupgradeneeded");
      const db = this.result;
      if (!db.objectStoreNames.contains('sites')) { // if there's no "sites" store
        db.createObjectStore('sites', {keyPath: 'id', autoIncrement: true }); // create it
      }
      if (!db.objectStoreNames.contains('options')) { // if there's no "options" store
        db.createObjectStore('options', {keyPath: 'id'}); // create it
      }
    }
  }

  private idb(storeName: IDBStoreName, requestName: IDBRequestName, param = null): Promise<any> {
    // console.log('idb:', storeName, requestName);

    return new Promise<any>((resolve, reject) => {
      const openRequest = indexedDB.open(this.idbName, this.idbVersion);

      let transactionMode: IDBTransactionMode;
      switch (requestName) {
        case 'count':
        case 'getAll':
        case 'search':
        case 'get':
          transactionMode = 'readonly';
          break;
        default:
          transactionMode = 'readwrite';
      }

      openRequest.onsuccess = function () {  
        const db = this.result;
        const transaction = db.transaction(storeName, transactionMode);
        const store = transaction.objectStore(storeName);
        // console.log('count in store:', 'count' in store);
        // console.log(store);

        let request: IDBRequest;

        function getResult() {
          const result = request.result;
          // console.log(`${requestName} result:`, result);
          resolve(result);
        }

        let resultArr = [];
        const search = requestName === 'search' && param;
        function collectResult() {
          let cursor = request.result;
          if (cursor) {
            const value = cursor.value;
            const searchTitle = search && value.title !== undefined;
            if (!searchTitle || (searchTitle && value.title.toLowerCase().includes(param.toLowerCase()))) {
              resultArr.push(value);
            }
            cursor.continue();
          } else {
            // console.log(`${requestName} resultArr:`, resultArr);
            resolve(resultArr);
          }
        };

        switch(requestName) {
          case 'count': 
            request = store.count();
            request.onsuccess = getResult;
            break;
          case 'getAll': 
            request = store.openCursor();
            request.onsuccess = collectResult;
            break;
          case 'search': 
            request = store.openCursor();
            request.onsuccess = collectResult;
            break;
          case 'get': 
            request = store.get(param);
            request.onsuccess = getResult;
            break;
          case 'add': 
            request = store.add(param);
            request.onsuccess = getResult;
            break;
          case 'put': 
            request = store.put(param);
            request.onsuccess = getResult;
            break;
          case 'delete': 
            request = store.delete(param);
            request.onsuccess = getResult;
            break;
        }

        request.onerror = function () {
          console.error(`${requestName} request.onerror:`, this.error);
          reject();
        };
      }

      openRequest.onerror = function () {
        console.error(`${requestName} openRequest.onerror:`, this.error);
        reject();
      };
    });
  }

  constructor(
    // private dbService: NgxIndexedDBService
  ) {
    this.idbInit();
  }

  /** GET sites count from db */
  getSitesLen(): Observable<number> {
    return new Observable(subscriber => {
      this.idb('sites', 'count').then(count => {
        // console.log('getSitesLen count:', count);
        subscriber.next(count);
      });
    });
  }

  /** GET sites from db, with search and pagination */
  getSites(pageParam = '', pageSize = 0, searchTerm = ''): Observable<SitesResponse> {
    return new Observable(subscriber => {
      this.idb('sites', 'search', searchTerm).then(sites => {
        sites = sites || [];
        // console.log(`getSites: searchTerm=${searchTerm}, pageSize=${pageSize}`);
        // console.log('sites:', sites);
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

  /** GET site by id from db */
  getById(id: number | string): Observable<Site> {
    return new Observable(subscriber => {
      this.idb('sites', 'get', +id).then(site => {
        // console.log(`getByKey site id=${id}`);
        subscriber.next({
          ...site,
          createDate: new Date(site ? site.createDate : null),
        });
      });
    });
  }

  /** POST: add a new site to db */
  addSite(site: Site): Observable<number> {
    return new Observable(subscriber => {
      this.idb('sites', 'add', site).then(siteid => {
        // console.log('addSite in IDB:', siteid);
        subscriber.next(siteid);
      });
    });
  }

  /** PUT: update the site in db */
  update(site: Site): Observable<any> {
    return new Observable(subscriber => {
      this.idb('sites', 'put', site).then(siteid => {
        // console.log('put (update) site in IDB:', siteid);
        subscriber.next();
      });
    });
  }

  /** DELETE: delete the site from db. Return true (deleted) or false. */
  delete(site: Site | number): Observable<boolean> {
    const id = typeof site === 'number' ? site : Number(site.id);

    return new Observable(subscriber => {
      this.idb('sites', 'delete', id).then(() => {
        // console.log(`deleted site id=${id}`);
        subscriber.next(true);
      });
    });
  }

  /** GET pageSize from db */
  getPageSize(): Observable<number> {
    return new Observable(subscriber => {
      this.idb('options', 'get', 'pageSize').then(pageSize => {
        // console.log('pageSize from IDB:', pageSize);
        const value = pageSize ? Number(pageSize.value) : 0;
        subscriber.next(value);
      });
    });
  }

  /** PUT: update the options.pageSize in db */
  setPageSize(pageSize: number): Observable<any> {
    return new Observable(subscriber => {
      this.idb('options', 'put', {id: 'pageSize', value: pageSize}).then(optId => {
        // console.log('update pageSize in IDB, id:', optId);
        subscriber.next();
      });
    });
  }
}
