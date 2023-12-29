import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import 'core-js/actual/array/from-async';
import { showDirectoryPicker } from 'file-system-access';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToolbarModule } from 'primeng/toolbar';

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
  readonly loading = signal(false);
  readonly files = signal<Array<FileSystemFileHandle>>([]);
  readonly page = signal(0);
  readonly first = signal(0);
  readonly itemsPerPage = signal(9);
  readonly columns = signal(3);

  readonly imageSlice = signal<Array<readonly [string, string]>>([]);

  readonly updateSliceEffect = effect(() => {
    const files = this.files();
    const filesSlice = files.slice(
      this.first(),
      this.first() + this.itemsPerPage()
    );
    Promise.all(
      filesSlice.map(async (handle) => {
        const file = await handle.getFile();
        return [handle.name, URL.createObjectURL(file)] as const;
      })
    ).then((slice) => this.imageSlice.set(slice));
  });

  async openFolderSelector(_$event: MouseEvent) {
    const directoryHandle = await showDirectoryPicker();
    this.loading.set(true);
    this.files.set([]);
    this.page.set(0);
    this.first.set(0);
    const buffer: FileSystemFileHandle[] = [];
    for await (const file of await getFilesRecursively(directoryHandle)) {
      if (buffer.length >= 40) {
        this.files.update((files) => [...files, ...buffer]);
        buffer.splice(0, buffer.length);
      }
      buffer.push(file);
    }
    this.files.update((files) => [...files, ...buffer]);
    this.loading.set(false);
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
}

function getAllFilesRecursively(
  directory: FileSystemDirectoryHandle
): Promise<FileSystemFileHandle[]> {
  // @ts-ignore
  return Array.fromAsync(getFilesRecursively(directory));
}

async function* getFilesRecursively(
  entry: FileSystemFileHandle | FileSystemDirectoryHandle
): AsyncGenerator<FileSystemFileHandle> {
  if (entry.kind === 'file') {
    const file = await entry.getFile();
    if (file !== null) {
      // file.relativePath = getRelativePath(entry);
      yield entry;
    }
  } else if (entry.kind === 'directory') {
    for await (const handle of entry.values()) {
      yield* getFilesRecursively(handle);
    }
  }
}
