import { AfterViewInit, Component, ElementRef, Renderer2, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TransferState, makeStateKey, StateKey } from '@angular/platform-browser';

@Component({
  selector: 'ngx-coffee-svg-icon',
  templateUrl: './coffee-svg-icon.component.html',
})
export class CoffeeSvgIconComponent implements AfterViewInit {
  @Input() src!: string; // The required 'src' attribute for the SVG path

  private readonly isBrowser: boolean;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.loadSvgIconBrowser();
    } else {
      this.loadSvgIconServer();
    }
  }

  private loadSvgIconBrowser(): void {
    if (!this.src) {
      console.error('SVG source path is not provided.');
      return;
    }

    fetch(this.src)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.statusText}`);
        }
        return response.text();
      })
      .then(svgContent => {
        this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', svgContent);
      })
      .catch(error => console.error('Error loading SVG:', error));
  }

  private loadSvgIconServer(): void {
    if (!this.src) {
      console.error('SVG source path is not provided.');
      return;
    }

    const stateKey: StateKey<string> = makeStateKey<string>(`svg-icon:${this.src}`);
    const cachedSvg = this.transferState.get(stateKey, null);

    if (cachedSvg) {
      this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', cachedSvg);
    } else {
      const fs = require('fs');  // Dynamically require 'fs' only when running on the server
      const path = require('path'); // Dynamically require 'path' only when running on the server

      const svgPath = path.resolve('dist/browser', this.src); 
      fs.readFile(svgPath, 'utf8', (err: any, data:any) => {
        if (err) {
          console.error('Error loading SVG on server:', err);
          return;
        }

        this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', data);
        this.transferState.set(stateKey, data);
      });
    }
  }
}
