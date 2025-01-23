import {InjectionToken} from '@angular/core';
import { MatDateFormats } from '@angular/material/core'; 

export const CUSTOM_DATE_FORMATS: MatDateFormats = {
    parse:{
        dateInput: 'DD/MM/YYYY'
    },
    display:{
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY'
    }
}

export const CUSTOM_DATE_FORMATS_TOKEN = new InjectionToken<MatDateFormats>('CUSTOM_DATE_FORMATS');