import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Site } from '../shared/interfaces';
import { SitesService } from '../shared/sites.service';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.scss']
})
export class EditPageComponent implements OnInit, OnDestroy {
  
  form: FormGroup;
  site: Site;
  submitted = false;
  uSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private sitesService: SitesService
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      switchMap((params: Params) => {
        return this.sitesService.getById(params['id']);
      })
    ).subscribe((site: Site) => {
      console.log(site);
      this.site = site;
      this.form = new FormGroup({
        title: new FormControl(site.title, Validators.required),
        siteDescription: new FormControl(site.siteDescription),
        body: new FormControl(site.body, Validators.required),
      });
    })
  }

  submit() {
    if (this.form.invalid) return;

    this.submitted = true;

    this.site = {
      ...this.site,
      title: this.form.value.title,
      siteDescription: this.form.value.siteDescription,
      body: this.form.value.body,
      updateDate: new Date(),
    };

    this.uSub = this.sitesService.update(this.site).subscribe(() => {
      this.submitted = false;
      console.log('after update:', this.site);
      //   this.alert.success('Пост обновлён.');
    })
  }

  changed() {
    return this.site.title !== this.form.value.title
      || this.site.siteDescription !== this.form.value.siteDescription
      || this.site.body !== this.form.value.body;
  }

  ngOnDestroy() {
    if (this.uSub) this.uSub.unsubscribe();
  }

}
