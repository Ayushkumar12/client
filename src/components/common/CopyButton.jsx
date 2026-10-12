import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!text) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy to clipboard failed:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard!' : `Copy ${text}`}
      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
        copied
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 text-neutral-500" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export default CopyButton;
