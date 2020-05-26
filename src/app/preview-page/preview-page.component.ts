import { Component, OnInit } from '@angular/core';

declare const makeSite: any;

@Component({
  selector: 'app-preview-page',
  templateUrl: './preview-page.component.html',
  styleUrls: ['./preview-page.component.scss']
})
export class PreviewPageComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
    makeSite();
  }

}
