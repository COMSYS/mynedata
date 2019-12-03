import {Directive, NgZone, TemplateRef, ViewContainerRef} from '@angular/core';

// thanks to dawidgarus @ https://github.com/angular/angular/issues/14033#issuecomment-307378389

@Directive({
  selector: '[ngCheckOnce]'
})
export class CheckOnceDirective {

  constructor(template: TemplateRef<any>, container: ViewContainerRef, zone: NgZone) {
    zone.runOutsideAngular(() => {
      const view = container.createEmbeddedView(template);
      setTimeout(() => view.detach());
    });
  }

}
