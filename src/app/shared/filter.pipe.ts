import { Pipe, PipeTransform } from '@angular/core';

import { Site } from './interfaces';

@Pipe({
  name: 'filterSites'
})
export class FilterPipe implements PipeTransform {

  transform(sites: Site[], filter = null): Site[] {
    if (!filter || !filter.trim()) return sites;

    return sites.filter(site => {
      return site.title.toLowerCase().includes(filter.toLowerCase());
    })
  }

}
