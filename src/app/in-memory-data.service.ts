import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';

import { Site } from './shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {

  constructor() { }

  createDb() {
    const sites = [
      {
        id: 1,
        title: 'Title a 1',
        siteDescription: 'siteDescription 1',
        body: '<h1>Hello world!</h1>',
        createDate: new Date(),
      },
      {
        id: 2,
        title: 'Title a 2',
        siteDescription: 'siteDescription 2',
        body: '<h1>Hello world again!!</h1>',
        createDate: new Date(),
      },
      {
        id: 3,
        title: 'Title a 3',
        siteDescription: 'siteDescription 3',
        body: '<h1>Hello world again!!</h1>',
        createDate: new Date(),
      },
      {
        id: 4,
        title: 'Title a 4',
        siteDescription: 'siteDescription 4',
        body: '<h1>Hello world again!!</h1>',
        createDate: new Date(),
      },
      {
        id: 5,
        title: 'Title b 5',
        siteDescription: 'siteDescription 5',
        body: '<h1>Hello world again!!</h1>',
        createDate: new Date(),
      },
    ];

    return {sites};
  }

  // Overrides the genId method to ensure that a site always has an id.
  // If the sites array is empty,
  // the method below returns the initial number (11).
  // if the sites array is not empty, the method below returns the highest
  // site id + 1.
  genId(sites: Site[]): number {
    return sites.length > 0 ? Math.max(...sites.map(site => site.id)) + 1 : 1;
  }
}
