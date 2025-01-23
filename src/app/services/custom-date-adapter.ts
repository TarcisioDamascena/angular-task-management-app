import { Injectable } from "@angular/core";
import { NativeDateAdapter } from "@angular/material/core";

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
    override format(date: Date, displayFormat: Object): string {
        const day = this.padTo2Digits(date.getDate());
        const month = this.padTo2Digits(date.getMonth() + 1);
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    private padTo2Digits(num: number): string {
        return num <10 ?'0' + num : num.toString();
    }
}