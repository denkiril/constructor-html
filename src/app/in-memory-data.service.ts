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
        title: 'Title 1',
        siteDescription: 'siteDescription 1',
        body: '<h1>Hello world!</h1>',
        createDate: new Date(),
        updateDate: new Date(),
      },
      {
        title: 'Title 2',
        siteDescription: 'siteDescription 2',
        body: '<h1>Hello world again!!</h1>',
        createDate: new Date(),
        updateDate: new Date(),
      },
    ];

    return {sites};
  }
}
