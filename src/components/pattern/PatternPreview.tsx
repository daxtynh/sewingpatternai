'use client';

import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface PatternPreviewProps {
  svg: string;
  patternName?: string;
  onDownloadSVG?: () => void;
  onDownloadPDF?: () => void;
}

export function PatternPreview({
  svg,
  patternName = 'Pattern Preview',
  onDownloadSVG,
  onDownloadPDF,
}: PatternPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.25), 3));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{patternName}</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="p-1.5"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="px-2 text-sm font-medium text-gray-600 min-w-[4rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="p-1.5"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="p-1.5"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadSVG}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              SVG
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onDownloadPDF}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div
          ref={containerRef}
          className={cn(
            'w-full h-full bg-gray-50 overflow-hidden',
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
