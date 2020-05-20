import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { Site } from '../shared/interfaces';
import { SitesService } from '../shared/sites.service';


@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {

  sites: Site[] = [];
  gSub: Subscription;
  sSub: Subscription;
  dSub: Subscription;
  form: FormGroup;
  searchStr = '';
  loading = true;
  pageSize = 3;
  pageIndex = 1;
  pageIndexMax = 1;

  // private initSites(sites: Site[], pageParam: string): void {
  //   const pageIndex = Number(pageParam);
  //   this.pageIndex = (sites.length > this.pageSize && pageIndex) ? pageIndex : 1;
  //   this.pageIndexMax = Math.ceil(sites.length / this.pageSize);

  //   const start = (this.pageIndex - 1) * this.pageSize;
  //   this.sites = sites.slice(start, start + this.pageSize);
  //   this.loading = false;

  //   console.log('sites.length:', this.sites.length);
  //   console.log('pageIndex:', this.pageIndex);
  //   console.log('pageIndexMax:', this.pageIndexMax);
  // }

  constructor(
    private sitesService: SitesService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      console.log('params: ', params);
      this.searchStr = params['s'];

      this.sitesService.getSites(params['p'], this.pageSize, this.searchStr).subscribe(resp => {
        console.log(resp);
        this.sites = resp.sites;
        this.pageIndex = resp.pageIndex;
        this.pageIndexMax = Math.ceil(resp.sitesLen / this.pageSize);

        this.loading = false;
      });
    })

    this.form = new FormGroup({
      search: new FormControl(null, Validators.required),
    });
  }

  ngOnDestroy() {
    if (this.gSub) this.gSub.unsubscribe();
    if (this.sSub) this.sSub.unsubscribe();
    if (this.dSub) this.dSub.unsubscribe();
  }

  submit() {
    if (this.form.invalid) return;

    const searchStr = this.form.value.search;
    this.form.reset();
    this.loading = true;
    this.router.navigate([], {
      queryParams: {
          s: searchStr,
      }
  });
  }

}
