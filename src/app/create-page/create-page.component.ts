import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Site } from '../shared/interfaces';
import { SitesService } from '../shared/sites.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.scss']
})
export class CreatePageComponent implements OnInit {

  form: FormGroup;
  createDate: Date;

  @ViewChild('navbar') private navbarComponent: NavbarComponent;

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
      createDate: this.createDate || new Date(),
    }

    // console.log(newSite);

    this.sitesService.addSite(newSite as Site).subscribe(site => {
      this.form.reset();
      this.navbarComponent.increaseSitesLen();
      // this.sites.push(site);
      // this.alert.success('Пост успешно создан.');
    })
  }

  handleFile(files: FileList): void {
    const file = files.item(0);

    file.text().then(text => {
      // console.log('handleFile', text);
      const uploaded = JSON.parse(text);

      if(uploaded.title) this.form.get('title').setValue(uploaded.title);
      if(uploaded.siteDescription) this.form.get('siteDescription').setValue(uploaded.siteDescription);
      if(uploaded.body) this.form.get('body').setValue(uploaded.body);
      if(uploaded.createDate) this.createDate = new Date(uploaded.createDate);
    });
  }

}
