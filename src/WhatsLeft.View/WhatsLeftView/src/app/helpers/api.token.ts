import { InjectionToken } from '@angular/core';
import { IApiService } from '../interfaces/api.interface';

export const API_SERVICE = new InjectionToken<IApiService>('API_SERVICE');
