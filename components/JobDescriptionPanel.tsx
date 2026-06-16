"use client";

interface Props {
  jd: string;
  onClose: () => void;
}

export default function JobDescriptionPanel({ jd, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a22] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="font-semibold">Job Description</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto p-6">
          <pre className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed font-sans">{jd}</pre>
        </div>
      </div>
    </div>
  );
}
