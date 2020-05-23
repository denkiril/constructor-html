import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { SitesService } from '../shared/sites.service';

@Component({
  selector: 'app-options-page',
  templateUrl: './options-page.component.html',
  styleUrls: ['./options-page.component.scss']
})
export class OptionsPageComponent implements OnInit, OnDestroy {

  form: FormGroup;
  submitted = false;
  gSub: Subscription;
  sSub: Subscription;
  pageSize: number;

  constructor(
    private sitesService: SitesService
  ) { }

  ngOnInit(): void {
    this.gSub = this.sitesService.getPageSize().subscribe(pageSize => {
      if (pageSize) this.pageSize = pageSize;

      this.form = new FormGroup({
        pageSize: new FormControl(this.pageSize),
      });
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.submitted = true;
    console.log('submit', this.form.value);

    const pageSize = this.form.value.pageSize;
    if (pageSize) {
      this.sSub = this.sitesService.setPageSize(pageSize).subscribe(() => {
        this.submitted = false;
        console.log('after pageSize update');
      });
    }
  }

  ngOnDestroy() {
    if (this.gSub) this.gSub.unsubscribe();
    if (this.sSub) this.sSub.unsubscribe();
  }

}
