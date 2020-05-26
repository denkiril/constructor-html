import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
// import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { faEdit, faTrashAlt, faFileExport, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import { Site } from '../shared/interfaces';
import { SitesService } from '../shared/sites.service';
import { NavbarComponent } from '../navbar/navbar.component';


@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {

  sites: Site[] = [];
  pSub: Subscription;
  gSub: Subscription;
  dSub: Subscription;
  form: FormGroup;
  searchStr = '';
  loading = true;
  pageSize = 5;
  pageIndex = 1;
  pageIndexMax = 1;
  sitesLen: number;

  faEdit = faEdit;
  faTrashAlt = faTrashAlt;
  faFileExport = faFileExport;
  faExternalLinkAlt = faExternalLinkAlt;

  @ViewChild('navbar') private navbarComponent: NavbarComponent;

  constructor(
    private sitesService: SitesService,
    private router: Router,
    private route: ActivatedRoute,
    // private sanitizer: DomSanitizer
  ) { }

  private loadSites(): void {
    this.route.queryParams.subscribe((params: Params) => {
      // console.log('params: ', params);
      this.searchStr = params['s'];
  
      this.pSub = this.sitesService.getPageSize().subscribe(pageSize => {
        // console.log('getPageSize:', pageSize);
        if (pageSize) this.pageSize = Number(pageSize);
  
        this.gSub = this.sitesService.getSites(params['p'], this.pageSize, this.searchStr).subscribe(resp => {
          // console.log(resp);
          this.sites = resp.sites;
          this.pageIndex = resp.pageIndex;
          this.sitesLen = resp.sitesLen;
          this.pageIndexMax = Math.ceil(this.sitesLen / this.pageSize);

          this.navbarComponent.setSitesLen(this.sitesLen);
          this.loading = false;
        });
      });
    })
  }

  ngOnInit(): void {
    this.loadSites();

    this.form = new FormGroup({
      search: new FormControl(null, Validators.required),
    });
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

  remove(id: number) {
    this.dSub = this.sitesService.delete(id).subscribe(deleted => {
      this.sites = this.sites.filter(site => site.id !== id);
      // this.loadSites();
      if (deleted) {
        this.sitesLen--;
        this.navbarComponent.setSitesLen(this.sitesLen);
      }
    })
  }

  // generateJsonUrl(site: Site) {
  //   // Create a blob of the data
  //   const blob = new Blob([JSON.stringify(site)], {
  //     type: 'application/json'
  //   });

  //   // return this.sanitizer.bypassSecurityTrustUrl('data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(site)));
  //   return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
  // }

  downloadJson(site: Site): void {
    const fileName = 'site.json';

    const blob = new Blob([JSON.stringify(site)], {
      type: 'application/json'
    });

    // const isIE = window.navigator.userAgent.indexOf("MSIE ");
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, fileName);
      // navigator.msSaveOrOpenBlob(blob, fileName); ?
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      // document.body.appendChild(a);
      // a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  preview(site: Site): void {
    // console.log(site);
    const newWindow = window.open('about:blank', '_blank');
    // newWindow.document.write(site.body);
    // newWindow.document.title = site.title;
    newWindow.document.write(
      `<script>
        var getData = new Promise(function(resolve) {
          var data = {
            title: 'Error. Site not found.',
            body: '<h1>Error. Site not found.</h1>',
          };
          var openRequest = indexedDB.open("chdb", 1);
          openRequest.onsuccess = function() {
            var db = this.result;
            var transaction = db.transaction('sites', 'readonly');
            var sites = transaction.objectStore('sites');
            var request = sites.get(${site.id});
            request.onsuccess = function() {
              var site = this.result;
              if (site) data = {
                title: site.title,
                body: site.body,
              };
              resolve(data);
            }
            request.onerror = function() {
              console.error("request.onerror", this.error);
              resolve(data);
            };
          }
          openRequest.onerror = function() {
            console.error("openRequest.onerror", this.error);
            resolve(data);
          };
        });

        getData.then(function(data) {
          document.title = data.title;
          document.write(data.body);
        });
      </script>`
    );
    // const newWindow = window.open('about:blank', '_blank');
    // newWindow.focus();
    // newWindow.onload = function() {
      // }
    // const html = '<div style="font-size:30px">Добро пожаловать!</div>';
    // newWindow.document.body.insertAdjacentHTML('afterbegin', site.body);
    
  }

  ngOnDestroy() {
    if (this.pSub) this.pSub.unsubscribe();
    if (this.gSub) this.gSub.unsubscribe();
    if (this.dSub) this.dSub.unsubscribe();
  }

}
