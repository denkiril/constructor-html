import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Site } from '../shared/interfaces';
import { SitesService } from '../shared/sites.service';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.scss']
})
export class CreatePageComponent implements OnInit {

  form: FormGroup;

  constructor(
    private sitesService: SitesService
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(null, Validators.required),
      siteDescription: new FormControl(),
      body: new FormControl(null, Validators.required),
    });
  }

  submit() {
    if (this.form.invalid) return;

    const newSite = {
      title: this.form.value.title,
      siteDescription: this.form.value.siteDescription,
      body: this.form.value.body,
      createDate: new Date(),
    }

    console.log(newSite);

    this.sitesService.addSite(newSite as Site).subscribe(site => {
      this.form.reset();
      console.log(site);
      // this.sites.push(site);
      // this.alert.success('Пост успешно создан.');
    })
  }

}
