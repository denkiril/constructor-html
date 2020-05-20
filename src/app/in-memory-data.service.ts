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
        title: 'Title a 1',
        siteDescription: 'siteDescription 1',
        body: '<h1>Hello world!</h1>',
        createDate: new Date(),
        updateDate: new Date(),
      },
      {
        title: 'Title a 2',
        siteDescription: 'siteDescription 2',
        body: '<h1>Hello world again!!</h1>',
        createDate: new Date(),
        updateDate: new Date(),
      },
      {
        title: 'Title a 3',
        siteDescription: 'siteDescription 3',
        body: '<h1>Hello world again!!</h1>',
        createDate: new Date(),
        updateDate: new Date(),
      },
      {
        title: 'Title a 4',
        siteDescription: 'siteDescription 4',
        body: '<h1>Hello world again!!</h1>',
        createDate: new Date(),
        updateDate: new Date(),
      },
      {
        title: 'Title b 5',
        siteDescription: 'siteDescription 5',
        body: '<h1>Hello world again!!</h1>',
        createDate: new Date(),
        updateDate: new Date(),
      },
    ];

    return {sites};
  }
}
