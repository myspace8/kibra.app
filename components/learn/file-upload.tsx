"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border-2 border-dashed rounded-md p-8 space-y-2 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50",
        "cursor-pointer",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf,.txt,.md,.markdown"
      />

      {selectedFile ? (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md mb-2">
            <File className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveFile()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">Click to change file</p>
        </div>
      ) : (
        <>
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">Upload sources</p>
          <p className="text-xs text-gray-400 text-center">Supported file types: jpg, png, pdf, txt, markdown</p>
          <Button variant="outline" size="sm" className="mt-2">
            Select File
          </Button>
        </>
      )}
    </div>
  )
}
