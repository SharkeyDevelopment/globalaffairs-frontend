import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Trash2, Upload, Loader2, FileUp, CheckCircle2 } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef, type ICellRendererParams } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import type { Document } from '@/types';

ModuleRegistry.registerModules([AllCommunityModule]);

function StatusRenderer({ value }: ICellRendererParams<Document, Document['status']>) {
  if (value === 'ready') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Ready
      </span>
    );
  }
  if (value === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      Error
    </span>
  );
}

function TagsRenderer({ value }: ICellRendererParams<Document, string[]>) {
  if (!value) return null;
  return (
    <div className="inline-flex flex-wrap items-center gap-1">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type UploadState = 'idle' | 'uploading' | 'done';

export function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadFileName, setUploadFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    const hasProcessing = documents.some((doc) => doc.status === 'processing');
    if (!hasProcessing) return;
    const interval = setInterval(fetchDocuments, 3000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const handleUpload = useCallback(async (file: File) => {
    setUploadFileName(file.name);
    setUploadState('uploading');

    try {
      const created = await api.createDocument(file, []);
      setDocuments((prev) => [created, ...prev]);
      setUploadState('done');
      setTimeout(() => {
        setUploadState('idle');
        setUploadFileName('');
      }, 1500);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadState('idle');
      setUploadFileName('');
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.deleteDocument(deleteTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setDeleteTarget(null);
  }

  const columnDefs = useMemo<ColDef<Document>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Document',
        flex: 2,
        cellClass: 'font-medium',
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        cellRenderer: StatusRenderer,
      },
      {
        field: 'tags',
        headerName: 'Tags',
        flex: 1,
        cellRenderer: TagsRenderer,
      },
      {
        field: 'uploadedAt',
        headerName: 'Uploaded',
        width: 140,
        valueFormatter: (params) => formatDate(params.value),
      },
      {
        field: 'pageCount',
        headerName: 'Pages',
        width: 90,
        cellClass: 'text-right',
        headerClass: 'ag-right-aligned-header',
      },
      {
        headerName: '',
        width: 70,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<Document>) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(params.data!)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Upload and manage your policy documents
        </p>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
        className={`relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : uploadState !== 'idle'
              ? 'border-border bg-muted/30 cursor-default'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
        />

        {uploadState === 'idle' && (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Drop files here or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, DOC, DOCX, or TXT up to 50MB
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-2 pointer-events-none">
              <Upload className="h-3.5 w-3.5" />
              Select File
            </Button>
          </>
        )}

        {uploadState === 'uploading' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Uploading...</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{uploadFileName}</p>
            </div>
          </div>
        )}

        {uploadState === 'done' && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Upload complete</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{uploadFileName}</p>
            </div>
          </div>
        )}
      </div>

      {/* AG Grid */}
      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading documents...</span>
          </div>
        ) : (
          <AgGridReact<Document>
            rowData={documents}
            columnDefs={columnDefs}
            rowHeight={48}
            domLayout="autoHeight"
            pagination={true}
            paginationPageSize={10}
            getRowId={(params) => params.data.id}
            theme={themeQuartz}
          />
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
