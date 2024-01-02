import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  WritableSignal,
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
import { toSignal } from '@angular/core/rxjs-interop';

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
  readonly files = toSignal(this.folderWatcher.filesFound$);
  readonly page = signal(0);
  readonly first = signal(0);
  readonly itemsPerPage = signal(9);
  readonly columns = signal(3);

  readonly imageSlice = signal<
    Array<readonly [string, string, ExifReader.Tags | undefined]>
  >([]);

  readonly updateSliceEffect = effect(async () => {
    const files = this.files()?.toReversed();
    const filesSlice =
      files?.slice(this.first(), this.first() + this.itemsPerPage()) ?? [];
    const slice = await Promise.all(
      filesSlice.map(
        async (
          handle
        ): Promise<readonly [string, string, ExifReader.Tags | undefined]> => {
          const file = await handle.file.getFile();
          let exifTags: ExifReader.Tags | undefined;
          try {
            if (file.type.startsWith('image')) {
              exifTags = await ExifReader.load(file);
            }
          } catch (err) {
            console.error('Failed to read tags from file', { cause: err });
          }
          return [
            handle.file.name,
            URL.createObjectURL(file),
            exifTags,
          ] as const;
        }
      )
    );
    this.imageSlice.set(slice);
  });

  async openFolderSelector(_$event: MouseEvent) {
    const directoryHandle = await showDirectoryPicker();
    if (!directoryHandle) {
      return;
    }
    this.folderWatcher.watchFolder(directoryHandle);
    this.page.set(0);
    this.first.set(0);
  }

  onPageChange($event: PaginatorState) {
    if ($event.page !== undefined) {
      this.page.set($event.page);
    }
    if ($event.first !== undefined) {
      this.first.set($event.first);
    }
    if ($event.rows !== undefined) {
      this.itemsPerPage.set($event.rows);
    }
  }

  checkExifData(_$event: MouseEvent, tags: ExifReader.Tags | undefined) {
    console.log({ tags });
    if (!tags) {
      return;
    }
    const { prompt, workflow } = tags;
    if (prompt) {
      try {
        const { value } = prompt;
        const cleanValue = value.replaceAll(/NaN/g, 'null');
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
