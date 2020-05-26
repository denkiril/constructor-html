import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { SitesService } from '../shared/sites.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  @Input() auto = true;
  gSub: Subscription;
  sitesLen: number;
  sitesLenVisible = false;

  constructor(
    private sitesService: SitesService,
  ) { }

  ngOnInit(): void {
    if (this.auto) this.updateSitesLen();
  }

  updateSitesLen(): void {
    // console.log('NAVBAR updateSitesLen');
    this.gSub = this.sitesService.getSites().subscribe(resp => {
      this.sitesLen = resp.sitesLen;
      this.sitesLenVisible = true;
    });
  }

  setSitesLen(sitesLen: number): void {
    // console.log('NAVBAR setSitesLen');
    this.sitesLen = sitesLen;
    this.sitesLenVisible = true;
  }

  increaseSitesLen(): void {
    this.sitesLen++;
  }

  ngOnDestroy() {
    if (this.gSub) this.gSub.unsubscribe();
  }

}
