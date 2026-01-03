import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { marked } from 'marked';
import ReactMarkdown from 'react-markdown';
import TurndownService from 'turndown';
import { Copy, Check } from 'lucide-react';

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

const MarkdownConverter = () => {
    const [mode, setMode] = useState('rich'); // 'rich' or 'plain'
    const [content, setContent] = useState(''); // Always stores markdown
    const [copied, setCopied] = useState(false);

    // Initialize TipTap editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px]',
            },
        },
        onUpdate: ({ editor }) => {
            // Only update content if we are in rich mode to avoid loops
            if (mode === 'rich') {
                const html = editor.getHTML();
                const markdown = turndownService.turndown(html);
                setContent(markdown);
            }
        },
    });

    // Sync TipTap content when mode changes or content changes externally
    useEffect(() => {
        if (mode === 'rich' && editor && content !== turndownService.turndown(editor.getHTML())) {
            // This is a bit tricky. We want to convert Markdown -> HTML -> TipTap
            // But for now, let's just plain HTML or simple parse since we don't have a robust Markdown->HTML converter in this direction easily without another lib.
            // Actually, 'react-markdown' renders to React Node, not HTML string for TipTap.
            // We might need a markdown parser to set content in TipTap if we switch BACK to rich text.
            // For this specific 'lab' tool, simple usage might suffice, but ideally we use 'marked' or similar if we need MD->HTML.
            // Let's rely on the fact that the user might paste or type. 
            // For the sake of this specific request, let's keep it simple:
            // If switching Plain -> Rich, we might lose some formatting if we don't parse correctly.
            // Let's standardise on using 'marked' for MD->HTML or just let TipTap handle text if it's basic.
            // Actually, TipTap allows setting content as Markdown if we used the markdown extension, but we didn't install it.
            // Let's just setContent as text for now to avoid complexity, or try to keep it simple.
            // Wait, if I switch from Plain (Markdown) -> Rich, I want to see that Markdown rendered as Rich Text in the editor.
            // I need a way to convert Markdown -> HTML to feed TipTap.
            // I'll leave this placeholder for now and treat it as a TODO or use a simple hack.
            // Hack: Just set invalid HTML? No. 
            // Let's assume for this iteration we assume converting *from* rich text is the primary flow, 
            // and *to* rich text might need manual adjustment or we add 'marked' dependency.
            // Actually, I should probably add 'marked' to make this complete.
            // Let me pause and add 'marked' quickly or use a simple internal converter.
            // Let's skip 'marked' for a second and just focus on the layout first.
        }
    }, [mode, editor]); // Removing 'content' from dependency to avoid loop for now

    // Manual fix to support Markdown -> HTML for TipTap if meaningful content exists
    // For the MVP requested, let's ensure the 'Rich -> Plain' works perfect.
    // The 'Plain -> Rich' might just interpret markdown as text if we aren't careful.

    const handleCopy = async () => {
        try {
            if (mode === 'rich') {
                await navigator.clipboard.writeText(content);
            } else {
                // If in plain mode, the "output" is the rendered rich text. 
                // Copying "Rich Text" to clipboard is complex (HTML mime type).
                // Standard "Copy" usually copies the plain text representation or we assume the user wants the *source*?
                // Request says: "text showing in the Output field will be copied".
                // In Plain Mode, Output is Rich Text. Copying rich text usually means copying HTML/formatted text.
                // Let's implement a copy of the *text content* of the rendered view for now, or just the markdown content?
                // "If the user presses that button then the text showing in the Output field will be copied"
                // If I see Bold "Hello" in output, and copy, I expect to paste Bold "Hello" in Word/Docs? 
                // Or do I get "**Hello**"? 
                // Given the tool is "Markdown Converter", usually you copy the *Code* (markdown).
                // But the prompt says "text showing in the Output".
                // Let's assume for Rich Text Output, we try to copy the Rendered Text (user visible).
                // But the simplest interpretation: Copy the content of the output box.
                // Case 1: Rich Input -> Output is Markdown Text. Copy = Copy Markdown.
                // Case 2: Plain Input -> Output is Rich Text Display. Copy = Copy accessible text? 
                // Let's assume case 2 copies the *Rich Text* (HTML/Clipboard data).
                // I'll stick to simple text copy for now and maybe upgrade if needed.
                // Actually, easiest is just copying the `content` (Markdown) in one case, and...
                // Wait, if I am in Plain mode, Input is Markdown, Output is Rich.
                // If I Click Copy on Output, I probably want the Rich Text to paste into an email or doc.
                // I will implement a clipboard write with 'text/html' for that case.
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const TopToggle = () => (
        <div className="flex items-center bg-gray-200 dark:bg-zinc-800 rounded-full p-1 w-48 relative cursor-pointer" onClick={() => setMode(mode === 'rich' ? 'plain' : 'rich')}>
            <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-zinc-600 rounded-full shadow-sm transition-all duration-300 ease-in-out ${mode === 'rich' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
            ></div>
            <div className={`flex-1 text-center text-sm font-medium z-10 transition-colors duration-300 ${mode === 'rich' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Rich Text
            </div>
            <div className={`flex-1 text-center text-sm font-medium z-10 transition-colors duration-300 ${mode === 'plain' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Plain Text
            </div>
        </div>
    );

    // Sync TipTap content when mode changes or content changes externally
    useEffect(() => {
        if (editor && mode === 'rich') {
            // Convert Markdown content to HTML before setting it in TipTap
            const html = marked.parse(content || '');
            editor.commands.setContent(html);
        }
    }, [mode, editor]); // Removing 'content' from dependency to avoid loop for now


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Markdown Converter</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Use this Markdown Converter to update your text and improve your AI Prompts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Input */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Input</h2>
                        <TopToggle />
                    </div>

                    <div className="flex-1 min-h-[500px] bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                        {mode === 'rich' ? (
                            <div className="flex-1 p-4 cursor-text" onClick={() => editor?.commands.focus()}>
                                <EditorContent editor={editor} />
                            </div>
                        ) : (
                            <textarea
                                className="w-full h-full p-4 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-gray-900 dark:text-white font-mono text-sm"
                                placeholder="Enter your Markdown text here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Output */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Output</h2>
                        <button
                            onClick={() => {
                                if (mode === 'rich') {
                                    copyToClipboard(content); // Copy Markdown
                                } else {
                                    // Copy Rich Text (try to copy pure text for now or implementation dependent)
                                    // A smart hack for copying rendered HTML is selecting the node.
                                    // For this MVP, let's just copy the raw text of the rendered markdown 
                                    // or just tell the user "Copied" (and copy the markdown source if that's safer?) 
                                    // User Request: "text showing in the Output field will be copied". 
                                    // That implies the *visible* text.
                                    const node = document.getElementById('markdown-output-preview');
                                    if (node) {
                                        const text = node.innerText;
                                        copyToClipboard(text);
                                    }
                                }
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    <div className="flex-1 min-h-[500px] bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-inner overflow-hidden flex flex-col relative">
                        {mode === 'rich' ? (
                            // Output is Plain Text (Markdown)
                            <textarea
                                className="w-full h-full p-4 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-gray-600 dark:text-gray-300 font-mono text-sm"
                                readOnly
                                value={content}
                            />
                        ) : (
                            // Output is Rich Text (rendered markdown)
                            <div id="markdown-output-preview" className="w-full h-full p-6 overflow-y-auto prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                                <ReactMarkdown>{content}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MarkdownConverter;
