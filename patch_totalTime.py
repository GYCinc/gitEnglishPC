import re

with open('App.tsx', 'r') as f:
    content = f.read()

# Make sure we use `blocks` everywhere instead of accessing `boardState.blocks` manually inside components!
# We just need to define `const { blocks, totalTime } = boardState;` right after `const [boardState, setBoardState] = useState(...)`

idx = content.find('const [{ blocks, totalTime }, setBoardState] = useState')
# actually we used `const [{ blocks, totalTime }, setBoardState]` which automatically destructures it!
# Let's verify that.
print(content[idx:idx+80])
