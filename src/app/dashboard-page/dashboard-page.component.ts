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

  constructor(
    private sitesService: SitesService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      console.log('params: ', params);
      this.searchStr = params['s'];
      if (this.searchStr) {
        this.sSub = this.sitesService.searchSites(this.searchStr).subscribe(sites => {
          this.sites = sites;
          this.loading = false;
          console.log('searchSites. loading = false. sites.l=', sites.length);
        });
      } else {
        this.gSub = this.sitesService.getAll().subscribe(sites => {
          this.sites = sites;
          this.loading = false;
          console.log('getAll. loading = false. sites.l=', sites.length);
        });
      }
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
