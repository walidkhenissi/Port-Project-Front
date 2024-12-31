import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';

@Pipe({
  name: 'getValue'
})
export class GetValuePipe implements PipeTransform {



  // constructor(private datePipe: DatePipe) {
  constructor() {
  }

  transform(value: any, args?: any): any {
    if (!value)
      return '';
    let sep = ' ';
    let splitted = args.split('|');
    if (splitted.length === 2)
      sep = splitted[1];

    let attrPaths = splitted[0].split('+');
    let result = "";
    let i = 0;
    for (let attrPath of attrPaths) {
      let attr = attrPath.split(':')[0];
      let type = attrPath.split(':')[1];
      let s = this.getAttrValue(value, attr, type);
      if (s === '' || s === undefined || s === null)
        continue;

      result += s + sep;
      i++;
    }
    if(i>0)
      return result.substring(0, result.length - sep.length);
    return result;
  }

  private getAttrValue(object:any, attrPath:any, type:any) {
    let path: Array<string> = attrPath.split('.');
    do {
      let attr = path.shift();
      // @ts-ignore
      object = object[attr] || '';
    } while (path.length)
    // if (type === 'date')
    //   return this.datePipe.transform(object, 'yyyy-MM-dd');
    return object;
  }

}
