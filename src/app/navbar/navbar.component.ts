import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { SitesService } from '../shared/sites.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  // @Input() auto = true;
  gSub: Subscription;
  sitesLen: number;
  sitesLenVisible = true;

  constructor(
    private sitesService: SitesService,
  ) { }

  ngOnInit(): void {
    this.updateSitesLen();
  }

  updateSitesLen(): void {
    this.gSub = this.sitesService.getSitesLen().subscribe(sitesLen => {
      this.sitesLen = sitesLen;
      this.sitesLenVisible = true;
      // console.log('NAVBAR updateSitesLen:', sitesLen);
    });
  }

  // setSitesLen(sitesLen: number): void {
  //   // console.log('NAVBAR setSitesLen');
  //   this.sitesLen = sitesLen;
  //   this.sitesLenVisible = true;
  // }

  increaseSitesLen(): void {
    this.sitesLen++;
  }

  decreaseSitesLen(): void {
    this.sitesLen--;
  }

  ngOnDestroy() {
    if (this.gSub) this.gSub.unsubscribe();
  }

}
