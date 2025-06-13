import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    const day = this._to2digit(date.getDate());
    const month = this._to2digit(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private _to2digit(n: number): string {
    return ('00' + n).slice(-2);
  }
}
