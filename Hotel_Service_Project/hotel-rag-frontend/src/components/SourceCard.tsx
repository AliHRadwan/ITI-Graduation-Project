import { Source } from '../types/chat';

interface SourceCardProps {
  source: Source;
}

export default function SourceCard({ source }: SourceCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {source.doc_collection}
            </span>
            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
              {source.category}
            </span>
          </div>
          <div className="font-medium text-gray-900">{source.source_file}</div>
          {source.section_title && (
            <div className="text-gray-600 text-xs mt-1">{source.section_title}</div>
          )}
        </div>
      </div>
    </div>
  );
}

