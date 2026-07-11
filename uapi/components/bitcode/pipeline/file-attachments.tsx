"use client";
import Image from 'next/image';

interface FileAttachmentsProps {
  selectedFiles: File[];
  onFilesSelected: (files: File[]) => void;
}

export const FileAttachments = ({
  selectedFiles,
  onFilesSelected
}: FileAttachmentsProps) => {
  return (
    <div data-testid="file-attachments" className="relative w-48">
      <div
        onClick={() => document.getElementById('hidden-file-input')?.click()}
        className={`
          flex items-center justify-between
          px-2 py-[6px]
          bg-[#030816]/90 
          border border-emerald-500/10
         
          transition-all duration-200
          hover:border-emerald-500/30 
          hover:shadow-[0_0_12px_rgba(103,254,183,0.15)]
          hover:bg-emerald-500/5
          cursor-pointer
          group
          min-h-[28px]
          ${selectedFiles.length > 0 ? 'border-emerald-500/30' : ''}
        `}
      >
        <div className="flex items-center">
          <Image
            src="/icons/upload.svg"
            width={12}
            height={12}
            alt=""
            className="w-3 h-3 ml-2 opacity-70 group-hover:opacity-100 transition-opacity"
          />
          <span className="mx-2 text-xs text-gray-100">
            {selectedFiles.length ? `Files (${selectedFiles.length})` : 'Files'}
          </span>
        </div>
      </div>

      <input
        data-testid="file-input"
        id="hidden-file-input"
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const newFiles = Array.from(e.target.files || []);
          onFilesSelected(newFiles);
        }}
      />
    </div>
  );
};

