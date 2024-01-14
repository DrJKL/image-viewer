import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import {
  combineLatestWith,
  map,
  shareReplay,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { createKeys } from '../../utils/type_utils';

export declare interface Settings {
  itemsPerPage: number;
  columns: number;
}

const DEFAULT_SETTINGS: Settings = {
  itemsPerPage: 8,
  columns: 4,
};
const SETTING_KEYS: Array<keyof Settings> = createKeys([
  'itemsPerPage',
  'columns',
]);

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly currentSettings$: Observable<Settings> =
    this.activeRoute.queryParams.pipe(
      map((params): Settings => {
        const realSettings: Settings = { ...DEFAULT_SETTINGS };
        for (const key of SETTING_KEYS) {
          if (params[key] == null) {
            continue;
          }
          realSettings[key] = Number(params[key]);
        }
        return realSettings;
      }),
      startWith(DEFAULT_SETTINGS),
      shareReplay(1)
    );

  watchSetting$<K extends keyof Settings>(
    whichSetting: K
  ): Observable<Settings[K]> {
    return this.currentSettings$.pipe(
      map((settings) => settings[whichSetting])
    );
  }

  updateSettings(newSettings: Partial<Settings>) {
    this.router.navigate([], {
      queryParams: { ...newSettings },
      queryParamsHandling: 'merge',
    });
  }
}
