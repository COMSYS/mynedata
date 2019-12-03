import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor() { }

  public static primitiveStrictEqualityTestObjects(obj1: Object, obj2: Object): boolean {
    const numberOfKeys = Object.keys(obj1).length;
    // if # of keys differ then the objects cannot be equal
    if (Object.keys(obj2).length !== numberOfKeys) {
      return false;
    }

    for (const key of Object.keys(obj1)) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    // when it got so far, the objects are considered equal
    return true;
  }
}
