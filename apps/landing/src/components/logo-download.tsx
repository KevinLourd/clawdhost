"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const logoFormats = [
  {
    name: "Square (Small)",
    file: "/clawdhost_logo_27kb.jpg",
    size: "27 KB",
    dimensions: "Square",
  },
  {
    name: "Square (Medium)",
    file: "/clawdhost_square_50kb.jpg",
    size: "50 KB",
    dimensions: "Square",
  },
  {
    name: "Landscape",
    file: "/clawdhost_landscape_64kb.jpg",
    size: "64 KB",
    dimensions: "Wide",
  },
];

interface LogoDownloadProps {
  size?: "sm" | "md";
}

export function LogoDownload({ size = "md" }: LogoDownloadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const logoSize = size === "sm" ? 32 : 44;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleDownload = async (file: string, name: string) => {
    try {
      const response = await fetch(file);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `molthost-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsOpen(false);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        title="Click to download logo"
      >
        <Image
          src="/clawdhost_logo_27kb.jpg"
          alt="MoltHost Logo"
          width={logoSize}
          height={logoSize}
          className="rounded-lg"
        />
        <span className={`font-bold ${size === "sm" ? "text-base" : "text-xl"}`}>
          MoltHost
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b bg-muted/30">
            <p className="text-sm font-medium">Download Logo</p>
            <p className="text-xs text-muted-foreground">Choose a format</p>
          </div>
          <div className="p-2">
            {logoFormats.map((format) => (
              <button
                key={format.file}
                onClick={() => handleDownload(format.file, format.name)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
              >
                <Image
                  src={format.file}
                  alt={format.name}
                  width={40}
                  height={40}
                  className="rounded border object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{format.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format.dimensions} • {format.size}
                  </p>
                </div>
                <svg
                  className="h-4 w-4 text-muted-foreground flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
