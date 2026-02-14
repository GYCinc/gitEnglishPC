import re

with open('components/Whiteboard.tsx', 'r') as f:
    content = f.read()

# 1. Insert Ref
if 'const lastZoomLogTime = useRef(0);' not in content:
    content = content.replace('const scaleRef = useRef(1);', 'const scaleRef = useRef(1);\n  const lastZoomLogTime = useRef(0);')

# 2. Insert Logging
logging_block = """    const now = Date.now();
    if (now - lastZoomLogTime.current > 1000) {
        logger?.logFocusItem('Movement', 'Canvas Zoom', 0.1, null, 1, [], `Scale: ${newScale.toFixed(2)}`);
        lastZoomLogTime.current = now;
    }
    setScale(newScale);"""

if 'lastZoomLogTime.current > 1000' not in content:
    # Use strict replacement for '    setScale(newScale);' (4 spaces indentation)
    if '    setScale(newScale);' in content:
        content = content.replace('    setScale(newScale);', logging_block)
    else:
        print("WARNING: Could not find setScale(newScale); with exact indentation")

# 3. Remove useEffect
remove_pattern = re.compile(r'\s*const isFirstRender = useRef\(true\);\s*// Debounced activity logging for Zoom\s*useEffect\(\(\) => \{[\s\S]*?\}, \[scale, logger\]\);', re.MULTILINE)

if remove_pattern.search(content):
    content = remove_pattern.sub('', content)
else:
    print("WARNING: Could not find useEffect block to remove!")

with open('components/Whiteboard.tsx', 'w') as f:
    f.write(content)
