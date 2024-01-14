import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import ExifReader from 'exifreader';
import { showDirectoryPicker } from 'file-system-access';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToolbarModule } from 'primeng/toolbar';
import { FolderWatcher, getFilesRecursively } from './folder_utils';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Settings, SettingsService } from '../settings/settings';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { ReplaySubject, firstValueFrom } from 'rxjs';

type ImageData = readonly [string, File, ExifReader.Tags | undefined];

@Component({
  selector: 'iv-viewer-view',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    ImageModule,
    InputNumberModule,
    PaginatorModule,
    ProgressBarModule,
    ToolbarModule,
  ],
  templateUrl: './viewer-view.component.html',
  styleUrl: './viewer-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerViewComponent {
  readonly folderWatcher = inject(FolderWatcher);
  readonly settings = inject(SettingsService);
  readonly files = toSignal(this.folderWatcher.filesFound$, {
    initialValue: [],
  });
  readonly page = signal(0);
  readonly first = signal(0);
  readonly refresh = signal(0);
  readonly itemsPerPage = toSignal(
    this.settings
      .watchSetting$('itemsPerPage')
      .pipe(takeUntilDestroyed(), shareReplay(1)),
    { requireSync: true }
  );
  readonly columns = toSignal(
    this.settings
      .watchSetting$('columns')
      .pipe(takeUntilDestroyed(), shareReplay(1)),
    { requireSync: true }
  );
  readonly pages = computed(() =>
    Math.ceil(this.files().length / this.itemsPerPage())
  );

  readonly imageSlice = signal<Array<ImageData>>([]);

  protected readonly updateSliceEffect = effect(async () => {
    void this.refresh();
    const files = this.files().toReversed();
    const filesSlice =
      files?.slice(this.first(), this.first() + this.itemsPerPage()) ?? [];
    const slice = await Promise.all(
      filesSlice.map(async (handle): Promise<ImageData> => {
        const file = await handle.file.getFile();
        let exifTags: ExifReader.Tags | undefined;
        try {
          if (file.type.startsWith('image')) {
            exifTags = await ExifReader.load(file);
          }
        } catch (err) {
          console.error('Failed to read tags from file', { cause: err });
        }
        return [handle.file.name, file, exifTags] as const;
      })
    );
    this.imageSlice.set(slice);
  });
  readonly columnEffect = effect(() => {
    const columns = Math.max(1, Math.min(this.columns(), this.itemsPerPage()));
    if (columns !== this.columns()) {
      this.settings.updateSettings({ columns });
    }
  });

  protected forceRefresh() {
    this.refresh.update((times) => times + 1);
  }

  protected async openFolderSelector(_$event: MouseEvent) {
    const directoryHandle = await showDirectoryPicker();
    if (!directoryHandle) {
      return;
    }
    this.folderWatcher.watchFolder(directoryHandle);
    this.page.set(0);
    this.first.set(0);
  }

  protected getSrc(imageFile: File) {
    return URL.createObjectURL(imageFile);
  }

  @HostListener('window:keydown', ['$event'])
  protected async onKeydown($event: KeyboardEvent) {
    const { target } = $event;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ) {
      return;
    }
    switch ($event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'ArrowRight':
      case 'd':
        const dir = $event.key === 'ArrowLeft' || $event.key === 'a' ? -1 : 1;
        const newPage = Math.max(
          0,
          Math.min(this.page() + dir, this.pages() - 1)
        );
        if (newPage !== this.page()) {
          this.page.set(newPage);
          this.first.set(this.page() * this.itemsPerPage());
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        const newColumnsMod = $event.key === 'ArrowDown' ? -1 : 1;
        const columns = Math.max(
          1,
          Math.min(this.columns() + newColumnsMod, this.itemsPerPage())
        );
        this.settings.updateSettings({ columns });
        break;
    }
  }

  protected onPageChange($event: PaginatorState) {
    if ($event.page !== undefined) {
      this.page.set($event.page);
    }
    if ($event.first !== undefined) {
      this.first.set($event.first);
    }
    if ($event.rows !== undefined) {
      this.settings.updateSettings({ itemsPerPage: $event.rows });
    }
  }

  protected checkExifData(
    _$event: MouseEvent,
    tags: ExifReader.Tags | undefined
  ) {
    console.log({ tags });
    if (!tags) {
      return;
    }
    const { prompt, workflow } = tags;
    if (prompt) {
      try {
        const { value } = prompt;
        const cleanValue = `${value}`.replaceAll(/NaN/g, 'null');
        const promptJSON = JSON.parse(cleanValue);
        console.log(promptJSON);
      } catch (error: unknown) {
        console.error('Failed to parse prompt', error);
      }
    }
    if (workflow) {
      try {
        const workflowJSON = JSON.parse(workflow.value);
        console.log(workflowJSON);
      } catch (error) {
        console.error('Failed to parse workflow', error);
      }
    }
  }
}

async function updateSignalWithBuffer<T>(
  signal: WritableSignal<T[]>,
  generator: AsyncGenerator<T>,
  bufferSize = 40
) {
  signal.set([]);
  const buffer: T[] = [];
  for await (const file of generator) {
    if (buffer.length >= bufferSize) {
      signal.update((files) => [...files, ...buffer]);
      buffer.splice(0, buffer.length);
    }
    buffer.push(file);
  }
  signal.update((files) => [...files, ...buffer]);
}
